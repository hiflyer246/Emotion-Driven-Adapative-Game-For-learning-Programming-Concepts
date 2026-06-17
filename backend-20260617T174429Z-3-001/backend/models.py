from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        # Mark as a string type in the OpenAPI/JSON schema
        json_schema = handler(schema)
        json_schema.update(type="string")
        return json_schema


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    username: str
    hashed_password: str
    current_level: int = 1
    total_xp: int = 0
    city_restoration_progress: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    achievements: List[str] = []
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class StoryProgress(BaseModel):
    user_id: str
    current_chapter: int = 1
    completed_chapters: List[int] = []
    city_buildings_restored: List[str] = []
    story_choices: Dict = {}

class UserStats(BaseModel):
    user_id: str
    total_questions_attempted: int = 0
    total_questions_solved: int = 0
    total_time_spent: float = 0
    emotion_distribution: Dict[str, int] = {}
    accuracy_by_difficulty: Dict[str, float] = {}
    average_time_per_question: float = 0
    streak_days: int = 0
    last_active: datetime = Field(default_factory=datetime.now)