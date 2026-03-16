"""Feed, search, bookmarks, and trending endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from clix.core.api import get_bookmarks, get_home_timeline, get_trending, search_tweets
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["feed"])


@router.get("/feed")
def feed(
    type: str = Query("for-you", description="for-you or following"),
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    return get_home_timeline(client, timeline_type=type, count=count, cursor=cursor)


@router.get("/search")
def search(
    query: str = Query(...),
    type: str = Query("Top", description="Top, Latest, Photos, or Videos"),
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    return search_tweets(client, query=query, search_type=type, count=count, cursor=cursor)


@router.get("/bookmarks")
def bookmarks(
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    return get_bookmarks(client, count=count, cursor=cursor)


@router.get("/trending")
def trending(client: XClient = Depends(get_client)):
    return get_trending(client)
