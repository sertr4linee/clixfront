"""Media upload and download endpoints."""

from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from clix.core.api import download_tweet_media, upload_media
from clix.core.client import XClient
from server.deps import get_client

router = APIRouter(tags=["media"])

_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4"}
_MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/media/upload")
async def upload(file: UploadFile, client: XClient = Depends(get_client)):
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported type: {file.content_type}")

    content = await file.read()
    if len(content) > _MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 5 MB limit")

    suffix = Path(file.filename or "upload").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        media_id = upload_media(client, tmp_path)
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    return {"media_id": media_id}


@router.post("/media/download/{tweet_id}")
def download(
    tweet_id: str,
    output_dir: str = ".",
    client: XClient = Depends(get_client),
):
    files = download_tweet_media(client, tweet_id, output_dir=output_dir)
    return {"files": files}
