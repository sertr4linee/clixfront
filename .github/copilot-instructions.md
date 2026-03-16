# Copilot Instructions

## Commands

```bash
uv sync                     # install dependencies (Python 3.11+ required)
ruff check .                # lint
ruff check --fix .          # lint + auto-fix
ruff format .               # format
pytest                      # full test suite
pytest tests/test_api.py    # single test file
pytest tests/test_api.py::TestCursorExtraction::test_cursor_top_extracted  # single test
pytest -m "not integration" # skip tests that require network + cookies
```

Pre-commit validation: `ruff format --check . && ruff check . && pytest`

## Architecture

Three-layer separation — each layer imports only inward:

- **`core/`** — pure business logic. No CLI or MCP imports. `XClient` (HTTP), `api.py` (Twitter API wrappers), `auth.py`, `config.py`. Fully testable in isolation.
- **`cli/`** — typer commands. Imports from `core/` and `models/` only. Shared utilities in `cli/helpers.py`.
- **`mcp/`** — FastMCP server (stdio transport), 42 tools. Imports from `core/` only, **never** from `cli/` or `display/`.
- **`display/`** — rich terminal formatting. Used only by `cli/`, never by `mcp/`.
- **`models/`** — pydantic v2 models shared across all layers.

`XClient` (`core/client.py`) handles TLS fingerprinting via `curl_cffi` Chrome impersonation. Exception hierarchy: `APIError` → `RateLimitError` / `StaleEndpointError` / `AuthError`.

Auth priority: env vars (`X_AUTH_TOKEN`, `X_CT0`) → stored credentials (`~/.config/clix/auth.json`) → browser cookie extraction.

## Key Conventions

**Output modes** — all CLI commands must support:
- Rich (default when stdout is a TTY)
- `--json` (also auto-activated when stdout is not a TTY)
- `--yaml`
- `--compact` / `-c` (token-optimized JSON for AI agents)

Use helpers from `cli/helpers.py`: `is_json_mode()`, `is_yaml_mode()`, `output_json()`, `output_compact()`, `output_yaml()`. Check `validate_output_flags()` to prevent conflicting flags.

**Exit codes:** 0 success, 1 general error, 2 auth error, 3 rate limit.

**MCP tools** return JSON strings. Errors use `{"error": "...", "type": "ErrorTypeName", "status_code": ..., "retry": bool}`.

**Pydantic models** for all data structures. Use `model_dump(mode="json")` when serializing for JSON output.

**Type hints on all function signatures. Docstrings on all public functions.**

**Ruff config:** `line-length = 100`, rules `E F I N W UP`, target Python 3.11.

## Testing Conventions

- Class-based test organization: `class TestSomeConcept:` with a docstring per test method explaining what it verifies.
- Mock `XClient` via `@patch("clix.core.api.XClient", autospec=True)`.
- Tests requiring live network/cookies: mark with `@pytest.mark.integration`.
- Use `tmp_path` fixture for any file I/O in tests.

## Git Workflow

- Branch from `dev`; never commit directly to `main`.
- Conventional commits: `feat(scope): message`, `fix(scope): message`, `refactor(scope): message`, etc.
- One logical change per PR, opened against `dev`.
