"""Direct message endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from clix.core.api import get_dm_inbox, get_user_by_handle, send_dm
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["dm"])


class DMSend(BaseModel):
    text: str


@router.get("/dm/inbox")
def inbox(client: XClient = Depends(get_client)):
    return get_dm_inbox(client)


@router.post("/dm/{handle}", status_code=201)
def send(handle: str, body: DMSend, client: XClient = Depends(get_client)):
    user = get_user_by_handle(client, handle)
    if not user:
        raise HTTPException(status_code=404, detail=f"User @{handle} not found")
    return send_dm(client, user.id, body.text)
