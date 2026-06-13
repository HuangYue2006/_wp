import json
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base, SessionLocal
from models import GameText
from routers import auth_router, game, leaderboard


def seed_texts():
    db = SessionLocal()
    existing = db.query(GameText).first()
    if existing:
        db.close()
        return

    texts_path = os.path.join(os.path.dirname(__file__), "data", "texts.json")
    with open(texts_path) as f:
        data = json.load(f)

    for difficulty, texts in data.items():
        for content in texts:
            db.add(GameText(content=content, difficulty=difficulty))
    db.commit()
    db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_texts()
    yield


app = FastAPI(title="TypeRush API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(game.router)
app.include_router(leaderboard.router)

frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
