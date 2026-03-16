"""Scheduled tweet endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from clix.core.api import create_scheduled_tweet, delete_scheduled_tweet, get_scheduled_tweets
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["scheduled"])


class ScheduledCreate(BaseModel):
    text: str
    execute_at: int  # Unix timestamp (seconds)
    media_ids: list[str] | None = None


@router.get("/scheduled")
def list_scheduled(client: XClient = Depends(get_client)):
    return get_scheduled_tweets(client)


@router.post("/scheduled", status_code=201)
def schedule(body: ScheduledCreate, client: XClient = Depends(get_client)):
    return create_scheduled_tweet(
        client,
        text=body.text,
        execute_at=body.execute_at,
        media_ids=body.media_ids,
    )


@router.delete("/scheduled/{scheduled_id}")
def cancel(scheduled_id: str, client: XClient = Depends(get_client)):
    return delete_scheduled_tweet(client, scheduled_id)
