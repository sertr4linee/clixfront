"""User profile and social action endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from clix.core.api import (
    block_user,
    follow_user,
    get_followers,
    get_following,
    get_user_by_handle,
    get_user_likes,
    get_user_tweets,
    mute_user,
    unblock_user,
    unfollow_user,
    unmute_user,
)
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["users"])


def _resolve(client: XClient, handle: str):
    """Fetch a user or raise 404."""
    user = get_user_by_handle(client, handle)
    if not user:
        raise HTTPException(status_code=404, detail=f"User @{handle} not found")
    return user


@router.get("/user/{handle}")
def get_user(handle: str, client: XClient = Depends(get_client)):
    return _resolve(client, handle)


@router.get("/user/{handle}/tweets")
def user_tweets(
    handle: str,
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    user = _resolve(client, handle)
    return get_user_tweets(client, user.id, count=count, cursor=cursor)


@router.get("/user/{handle}/likes")
def user_likes(
    handle: str,
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    user = _resolve(client, handle)
    return get_user_likes(client, user.id, count=count, cursor=cursor)


@router.get("/user/{handle}/followers")
def user_followers(
    handle: str,
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    user = _resolve(client, handle)
    users, next_cursor = get_followers(client, user.id, count=count, cursor=cursor)
    return {"users": users, "cursor": next_cursor}


@router.get("/user/{handle}/following")
def user_following(
    handle: str,
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    user = _resolve(client, handle)
    users, next_cursor = get_following(client, user.id, count=count, cursor=cursor)
    return {"users": users, "cursor": next_cursor}


@router.post("/user/{handle}/follow")
def follow(handle: str, client: XClient = Depends(get_client)):
    return follow_user(client, _resolve(client, handle).id)


@router.delete("/user/{handle}/follow")
def unfollow(handle: str, client: XClient = Depends(get_client)):
    return unfollow_user(client, _resolve(client, handle).id)


@router.post("/user/{handle}/block")
def block(handle: str, client: XClient = Depends(get_client)):
    return block_user(client, _resolve(client, handle).id)


@router.delete("/user/{handle}/block")
def unblock(handle: str, client: XClient = Depends(get_client)):
    return unblock_user(client, _resolve(client, handle).id)


@router.post("/user/{handle}/mute")
def mute(handle: str, client: XClient = Depends(get_client)):
    return mute_user(client, _resolve(client, handle).id)


@router.delete("/user/{handle}/mute")
def unmute(handle: str, client: XClient = Depends(get_client)):
    return unmute_user(client, _resolve(client, handle).id)
