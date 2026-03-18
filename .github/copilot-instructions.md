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
uvicorn server.main:app --reload --port 8000  # start REST API server
```

Pre-commit validation: `ruff format --check . && ruff check . && pytest`

## Architecture

Four interfaces, all built on `core/` — each layer imports only inward:

- **`core/`** — pure business logic. No CLI, MCP, or server imports. `XClient` (HTTP), `api.py` (Twitter API wrappers), `auth.py`, `config.py`. Fully testable in isolation.
- **`cli/`** — typer commands. Imports from `core/` and `models/` only. Shared utilities in `cli/helpers.py`. Global flags (`--compact`, `--full-text`, `--yaml`) passed via `ctx.obj`.
- **`mcp/`** — FastMCP server (stdio transport). Imports from `core/` only, **never** from `cli/` or `display/`.
- **`server/`** — FastAPI REST server (`uvicorn server.main:app`). Imports from `core/` only. Routes mirror CLI commands under `/api`. `server/deps.py` provides `get_client()` as a FastAPI dependency; pass `X-Account` header for multi-account. `server/errors.py` maps `APIError`/`RateLimitError`/`StaleEndpointError`/`AuthError` to HTTP status codes.
- **`display/`** — rich terminal formatting. Used only by `cli/`, never by `mcp/` or `server/`.
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

**MCP tools** return `str` (JSON serialized). Wrap tool bodies in `try/except` and return `_error_response()` on failure. Errors use `{"error": "...", "type": "ErrorTypeName", "status_code": ..., "retry": bool}`.

**Pydantic models** for all data structures. Use `model_dump(mode="json")` when serializing for JSON output.

**Type hints on all function signatures. Docstrings on all public functions.**

**Ruff config:** `line-length = 100`, rules `E F I N W UP`, target Python 3.11.

## XClient Methods

- `graphql_get(operation, variables)` — dynamic query ID resolved from JS bundle at runtime
- `graphql_post(operation, variables)` — dynamic query ID resolved from JS bundle at runtime
- `graphql_post_raw(query_id, operation, variables)` — hardcoded query ID (for ops not in JS bundles)
- `rest_post(url, data)` — form-encoded REST POST (follow, block, mute)
- `rest_get(url, params)` — authenticated REST GET (trending, DM inbox)

## GraphQL API Gotchas

- **Always check required variables**: X GraphQL endpoints may require variables even when they seem optional. Missing variables cause HTTP 422.
- **Fallback query IDs**: Some operations (`SearchTimeline`, `CreateRetweet`, `CreateBookmark`, `DeleteBookmark`, scheduled tweet ops) are not in X.com JS bundles — use `FALLBACK_OPERATIONS` in `endpoints.py` or `graphql_post_raw()`.
- **BookmarkSearchTimeline**: `rawQuery: ""` triggers `ERROR_EMPTY_QUERY`. Use a broad catch-all OR query to fetch all bookmarks.
- **Response paths change**: Always verify actual response structure and add new paths to `_find_instructions()` in `api.py`.
- For user-action commands (follow, block, mute, etc.), resolve handle → user ID via `get_user_by_handle()` before calling the action.

## Testing Conventions

- Class-based test organization: `class TestSomeConcept:` with a docstring per test method explaining what it verifies.
- Mock `XClient` via `@patch("clix.core.api.XClient", autospec=True)`.
- Tests requiring live network/cookies: mark with `@pytest.mark.integration`.
- Use `tmp_path` fixture for any file I/O in tests.

## Git Workflow

- Branch from `dev`; never commit directly to `main`.
- Conventional commits: `feat(scope): message`, `fix(scope): message`, `refactor(scope): message`, etc.
- One logical change per PR, opened against `dev`.
