"""Tweet CRUD and engagement action endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from clix.core.api import (
    bookmark_tweet,
    create_tweet,
    delete_tweet,
    get_tweet_detail,
    like_tweet,
    retweet,
    unbookmark_tweet,
    unlike_tweet,
    unretweet,
)
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["tweets"])


class TweetCreate(BaseModel):
    text: str
    reply_to: str | None = None
    quote: str | None = None
    media_ids: list[str] | None = None


@router.get("/tweet/{tweet_id}")
def get_tweet(
    tweet_id: str,
    thread: bool = Query(False),
    client: XClient = Depends(get_client),
):
    tweets = get_tweet_detail(client, tweet_id)
    if not tweets:
        raise HTTPException(status_code=404, detail="Tweet not found")
    return tweets if thread else tweets[0]


@router.post("/tweet", status_code=201)
def post_tweet(body: TweetCreate, client: XClient = Depends(get_client)):
    return create_tweet(
        client,
        text=body.text,
        reply_to_id=body.reply_to,
        quote_tweet_url=body.quote,
        media_ids=body.media_ids,
    )


@router.delete("/tweet/{tweet_id}")
def remove_tweet(tweet_id: str, client: XClient = Depends(get_client)):
    return delete_tweet(client, tweet_id)


@router.post("/tweet/{tweet_id}/like")
def like(tweet_id: str, client: XClient = Depends(get_client)):
    return like_tweet(client, tweet_id)


@router.delete("/tweet/{tweet_id}/like")
def unlike(tweet_id: str, client: XClient = Depends(get_client)):
    return unlike_tweet(client, tweet_id)


@router.post("/tweet/{tweet_id}/retweet")
def do_retweet(tweet_id: str, client: XClient = Depends(get_client)):
    return retweet(client, tweet_id)


@router.delete("/tweet/{tweet_id}/retweet")
def do_unretweet(tweet_id: str, client: XClient = Depends(get_client)):
    return unretweet(client, tweet_id)


@router.post("/tweet/{tweet_id}/bookmark")
def add_bookmark(tweet_id: str, client: XClient = Depends(get_client)):
    return bookmark_tweet(client, tweet_id)


@router.delete("/tweet/{tweet_id}/bookmark")
def remove_bookmark(tweet_id: str, client: XClient = Depends(get_client)):
    return unbookmark_tweet(client, tweet_id)
