import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, GameText, Score
from schemas import ScoreSubmit, ScoreResponse, GameTextResponse
from auth import get_current_user

router = APIRouter(prefix="/api/game", tags=["game"])


@router.get("/text", response_model=GameTextResponse)
def get_game_text(difficulty: str = "easy", db: Session = Depends(get_db)):
    texts = db.query(GameText).filter(GameText.difficulty == difficulty).all()
    if not texts:
        texts = db.query(GameText).all()
    chosen = random.choice(texts)
    return GameTextResponse.model_validate(chosen)


@router.post("/submit", response_model=ScoreResponse)
def submit_score(
    data: ScoreSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    score = Score(
        user_id=current_user.id,
        wpm=data.wpm,
        accuracy=data.accuracy,
        difficulty=data.difficulty,
        total_chars=data.total_chars,
        correct_chars=data.correct_chars,
        duration_seconds=data.duration_seconds,
    )
    db.add(score)
    db.commit()
    db.refresh(score)

    return ScoreResponse(
        id=score.id,
        username=current_user.username,
        wpm=score.wpm,
        accuracy=score.accuracy,
        difficulty=score.difficulty,
        duration_seconds=score.duration_seconds,
        created_at=score.created_at,
    )


@router.get("/history", response_model=list[ScoreResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores = (
        db.query(Score)
        .filter(Score.user_id == current_user.id)
        .order_by(Score.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        ScoreResponse(
            id=s.id,
            username=current_user.username,
            wpm=s.wpm,
            accuracy=s.accuracy,
            difficulty=s.difficulty,
            duration_seconds=s.duration_seconds,
            created_at=s.created_at,
        )
        for s in scores
    ]
