from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ScoreSubmit(BaseModel):
    wpm: float = Field(..., gt=0)
    accuracy: float = Field(..., ge=0, le=100)
    difficulty: str = Field(..., pattern="^(easy|medium|hard|expert)$")
    total_chars: int = Field(..., gt=0)
    correct_chars: int = Field(..., ge=0)
    duration_seconds: float = Field(..., gt=0)


class ScoreResponse(BaseModel):
    id: int
    username: str
    wpm: float
    accuracy: float
    difficulty: str
    duration_seconds: float
    created_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardResponse(BaseModel):
    scores: list[ScoreResponse]
    total: int
    page: int
    limit: int


class GameTextResponse(BaseModel):
    id: int
    content: str
    category: str
    difficulty: str

    model_config = {"from_attributes": True}
