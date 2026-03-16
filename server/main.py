"""FastAPI server — REST wrapper over clix.core.*

Run with:
    uvicorn server.main:app --reload --port 8000
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.errors import setup_exception_handlers
from server.routes import auth, dm, feed, lists, media, scheduled, tweet, user

app = FastAPI(
    title="clix API",
    version="0.3.1",
    description="REST API for clix — Twitter/X CLI without API keys",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)

app.include_router(feed.router, prefix="/api")
app.include_router(tweet.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(lists.router, prefix="/api")
app.include_router(dm.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(scheduled.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": "0.3.1"}
