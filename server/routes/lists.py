"""Twitter/X Lists management endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from clix.core.api import (
    add_list_member,
    create_list,
    delete_list,
    get_list_members,
    get_list_tweets,
    get_user_by_handle,
    get_user_lists,
    pin_list,
    remove_list_member,
    unpin_list,
)
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["lists"])


class ListCreate(BaseModel):
    name: str
    description: str = ""
    is_private: bool = False


class ListMemberAdd(BaseModel):
    handle: str


@router.get("/lists")
def get_lists(client: XClient = Depends(get_client)):
    return get_user_lists(client)


@router.post("/lists", status_code=201)
def create(body: ListCreate, client: XClient = Depends(get_client)):
    return create_list(
        client, name=body.name, description=body.description, is_private=body.is_private
    )


@router.delete("/lists/{list_id}")
def delete(list_id: str, client: XClient = Depends(get_client)):
    return delete_list(client, list_id)


@router.get("/lists/{list_id}/timeline")
def list_timeline(
    list_id: str,
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    return get_list_tweets(client, list_id, count=count, cursor=cursor)


@router.get("/lists/{list_id}/members")
def list_members(
    list_id: str,
    count: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    client: XClient = Depends(get_client),
):
    users, next_cursor = get_list_members(client, list_id, count=count, cursor=cursor)
    return {"users": users, "cursor": next_cursor}


@router.post("/lists/{list_id}/members")
def add_member(list_id: str, body: ListMemberAdd, client: XClient = Depends(get_client)):
    user = get_user_by_handle(client, body.handle)
    if not user:
        raise HTTPException(status_code=404, detail=f"User @{body.handle} not found")
    return add_list_member(client, list_id, user.id)


@router.delete("/lists/{list_id}/members/{user_id}")
def remove_member(list_id: str, user_id: str, client: XClient = Depends(get_client)):
    return remove_list_member(client, list_id, user_id)


@router.post("/lists/{list_id}/pin")
def pin(list_id: str, client: XClient = Depends(get_client)):
    return pin_list(client, list_id)


@router.delete("/lists/{list_id}/pin")
def unpin(list_id: str, client: XClient = Depends(get_client)):
    return unpin_list(client, list_id)
