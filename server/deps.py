"""FastAPI dependency injection — provides an XClient per request."""

from __future__ import annotations

import os

from fastapi import Header

from clix.core.client import XClient
from clix.core.config import Config


def get_client(x_account: str | None = Header(None, alias="X-Account")) -> XClient:
    """Return a configured XClient. Credentials are loaded lazily on first API call."""
    proxy = os.environ.get("CLIX_PROXY") or Config.load().network.proxy or None
    return XClient(account=x_account or None, proxy=proxy or None)
