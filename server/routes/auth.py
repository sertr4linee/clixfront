"""Auth status endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from clix.core.auth import list_accounts
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["auth"])


@router.get("/auth/status")
def auth_status(client: XClient = Depends(get_client)):
    try:
        creds = client.credentials
        return {
            "authenticated": True,
            "account": creds.account_name,
            "accounts": list_accounts(),
        }
    except Exception as exc:
        return {
            "authenticated": False,
            "error": str(exc),
            "accounts": list_accounts(),
        }
