from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import Score
from schemas import ScoreResponse, LeaderboardResponse

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardResponse)
def get_leaderboard(
    difficulty: str | None = Query(None, pattern="^(easy|medium|hard|expert)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Score).join(Score.user)

    if difficulty:
        query = query.filter(Score.difficulty == difficulty)

    total = query.count()
    scores = (
        query.order_by(desc(Score.wpm))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return LeaderboardResponse(
        scores=[
            ScoreResponse(
                id=s.id,
                username=s.user.username,
                wpm=s.wpm,
                accuracy=s.accuracy,
                difficulty=s.difficulty,
                duration_seconds=s.duration_seconds,
                created_at=s.created_at,
            )
            for s in scores
        ],
        total=total,
        page=page,
        limit=limit,
    )
