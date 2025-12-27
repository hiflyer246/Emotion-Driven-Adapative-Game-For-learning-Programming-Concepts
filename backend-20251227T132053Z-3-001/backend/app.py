# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import base64
import io
import json
from datetime import datetime
import numpy as np
from PIL import Image
from deepface import DeepFace
from google import genai
from google.genai import types
from collections import deque
import os
from bson import ObjectId

from database import connect_to_mongo, close_mongo_connection, get_database
from models import UserCreate, UserLogin, User, StoryProgress, UserStats
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from story_data import STORY_CHAPTERS, BUILDINGS, EMOTION_STORY_RESPONSES, ACHIEVEMENTS
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm

# Initialize FastAPI
app = FastAPI(title="Code Runner API", version="1.0.0")
GEMINI_API_KEY = "AIzaSyBZG_-hW_sFDLdXJgTtCVomobSaRc9s2ZI"
# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google Gemini
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# In-memory storage (replace with MongoDB/PostgreSQL in production)
questions_db = []
sessions = {}

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    if len(questions_db) == 0:
        print("🔄 Database empty. Generate questions using POST /api/generate-questions")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
# ========================================
# Data Models
# ========================================

class EmotionDetectionRequest(BaseModel):
    image: str  # Base64 encoded image
    questionId: str
    timeSpent: float  # seconds
    sessionId: str

class EmotionDetectionResponse(BaseModel):
    emotion: str
    raw_emotions: Dict[str, float]
    hint_recommendation: Dict
    confidence: float

class QuestionGenerationRequest(BaseModel):
    topic: str
    difficulty: str  # easy, medium, hard
    count: int = 5

class Question(BaseModel):
    id: str
    topic: str
    difficulty: str
    question: str
    example_input: str
    example_output: str
    hint_level_1: str
    hint_level_2: str
    hint_level_3: str
    explanation: str
    bonus_challenge: str
    common_mistakes: List[str]
    time_complexity: str
    space_complexity: str
    created_at: str

class SessionData(BaseModel):
    sessionId: str
    emotion_history: List[Dict]
    hints_given: List[Dict]
    questions_attempted: List[str]
    start_time: str

class AnswerSubmission(BaseModel):
    sessionId: str
    questionId: str
    answer: str
    timeTaken: float

# ========================================
# Helper Functions
# ========================================

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Convert base64 string to numpy array for DeepFace"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB numpy array
        image_array = np.array(image.convert('RGB'))
        return image_array
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

def map_to_game_emotion(emotions: Dict[str, float], time_spent: float) -> str:
    """
    Map DeepFace standard emotions to game-specific emotions
    DeepFace: angry, disgust, fear, happy, sad, surprise, neutral
    Game: happy, bored, frustrated, confused, focused, sad
    """
    
    # Focused: neutral + reasonable time + engagement
    if emotions['neutral'] > 0.5 and time_spent < 120:
        return 'focused'
    
    # Bored: neutral + long time OR very high neutral with low other emotions
    if (emotions['neutral'] > 0.4 and time_spent > 180) or \
       (emotions['neutral'] > 0.7 and time_spent > 60):
        return 'bored'
    
    # Frustrated: angry OR disgust dominant
    if emotions['angry'] > 0.3 or emotions['disgust'] > 0.3:
        return 'frustrated'
    
    # Confused: fear OR surprise (in learning context)
    if emotions['fear'] > 0.2 or emotions['surprise'] > 0.3:
        return 'confused'
    
    # Happy: happy emotion dominant
    if emotions['happy'] > 0.5:
        return 'happy'
    
    # Sad: sad emotion dominant
    if emotions['sad'] > 0.4:
        return 'sad'
    
    # Default to focused
    return 'focused'

def calculate_sustained_emotion(emotion_history: List[Dict], target_emotion: str) -> float:
    """Calculate how long (in seconds) an emotion has been sustained"""
    if not emotion_history:
        return 0
    
    # Look at last 30 records (60 seconds at 2s intervals)
    recent_history = emotion_history[-30:]
    
    sustained_count = 0
    for record in reversed(recent_history):
        if record['emotion'] == target_emotion:
            sustained_count += 1
        else:
            break
    
    # Each record represents ~2 seconds
    return sustained_count * 2

def determine_hint_strategy(
    emotion: str,
    question_id: str,
    time_spent: float,
    emotion_history: List[Dict],
    hints_already_given: List[Dict]
) -> Dict:
    """
    Decide what action to take based on emotion and context
    Returns hint recommendation or other adaptive action
    """
    
    # Find question in database
    question = next((q for q in questions_db if q['id'] == question_id), None)
    if not question:
        return {"action": "none", "message": ""}
    
    # Calculate sustained emotion duration
    sustained_duration = calculate_sustained_emotion(emotion_history, emotion)
    
    # Count hints already given for this question
    question_hints = [h for h in hints_already_given if h['questionId'] == question_id]
    hint_count = len(question_hints)
    
    # === EMOTION-BASED STRATEGY ===
    
    # FRUSTRATED: Give progressive hints
    if emotion == 'frustrated':
        if sustained_duration >= 15 and hint_count == 0:
            return {
                "action": "provide_hint",
                "hint": question['hint_level_1'],
                "hint_level": 1,
                "message": "You seem stuck. Here's a hint to help you out! 💡"
            }
        elif sustained_duration >= 30 and hint_count == 1:
            return {
                "action": "provide_hint",
                "hint": question['hint_level_2'],
                "hint_level": 2,
                "message": "Let's break this down step by step. 🤗"
            }
        elif sustained_duration >= 45 and hint_count == 2:
            return {
                "action": "provide_hint",
                "hint": question['hint_level_3'],
                "hint_level": 3,
                "message": "Here's a detailed walkthrough to help you. 📚",
                "common_mistakes": question['common_mistakes']
            }
    
    # CONFUSED: Start with gentle hint
    elif emotion == 'confused':
        if sustained_duration >= 20 and hint_count == 0:
            return {
                "action": "provide_hint",
                "hint": question['hint_level_1'],
                "hint_level": 1,
                "message": "Here's something to think about... 🤔"
            }
        elif sustained_duration >= 45 and hint_count == 1:
            return {
                "action": "provide_hint",
                "hint": question['hint_level_2'],
                "hint_level": 2,
                "message": "Let me explain the approach... 💭"
            }
    
    # BORED: Offer bonus challenge
    elif emotion == 'bored':
        if sustained_duration >= 20:
            return {
                "action": "bonus_challenge",
                "content": question['bonus_challenge'],
                "message": "🎯 Ready for an extra challenge?",
                "xp_bonus": 50
            }
    
    # SAD: Provide encouragement + gentle hint
    elif emotion == 'sad':
        if sustained_duration >= 10 and hint_count == 0:
            return {
                "action": "provide_hint",
                "hint": question['hint_level_1'],
                "hint_level": 1,
                "message": "💙 Don't worry, you've got this! Here's a small hint to get you started."
            }
    
    # HAPPY/FOCUSED: No intervention, just encouragement
    elif emotion in ['happy', 'focused']:
        if time_spent > 30 and hint_count == 0:
            return {
                "action": "encouragement",
                "message": "Keep up the great work! You're doing amazing! 🌟"
            }
    
    # No action needed
    return {"action": "none"}

def generate_unique_id(prefix: str = "q") -> str:
    """Generate unique ID for questions"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"{prefix}_{timestamp}_{len(questions_db)}"

# ========================================
# API Endpoints
# ========================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Code Runner API",
        "version": "1.0.0",
        "endpoints": {
            "emotion_detection": "/api/detect-emotion",
            "generate_questions": "/api/generate-questions",
            "get_questions": "/api/questions",
            "submit_answer": "/api/submit-answer",
            "create_session": "/api/session/create"
        }
    }

@app.post("/api/session/create")
async def create_session():
    """Create a new game session"""
    session_id = f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    sessions[session_id] = {
        "sessionId": session_id,
        "emotion_history": deque(maxlen=100),  # Keep last 100 emotions
        "hints_given": [],
        "questions_attempted": [],
        "start_time": datetime.now().isoformat(),
        "xp": 0,
        "questions_solved": 0
    }
    
    return {
        "sessionId": session_id,
        "message": "Session created successfully"
    }

@app.post("/api/detect-emotion", response_model=EmotionDetectionResponse)
async def detect_emotion(request: EmotionDetectionRequest):
    """
    Detect emotion from webcam image using DeepFace
    Returns emotion and adaptive hint recommendation
    """
    try:
        # Decode image
        image_array = decode_base64_image(request.image)
        
        # === DEEPFACE EMOTION DETECTION ===
        result = DeepFace.analyze(
            img_path=image_array,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv',
            silent=True
        )
        
        # Extract emotion data
        if isinstance(result, list):
            result = result[0]
        
        # Convert numpy types to Python native types
        emotions = {k: float(v) for k, v in result['emotion'].items()}
        dominant_emotion = str(result['dominant_emotion'])
        
        # Map to game-specific emotion
        game_emotion = map_to_game_emotion(emotions, request.timeSpent)
        
        # Get or create session
        if request.sessionId not in sessions:
            sessions[request.sessionId] = {
                "emotion_history": deque(maxlen=100),
                "hints_given": [],
                "questions_attempted": []
            }
        
        session = sessions[request.sessionId]
        
        # Store emotion in history
        emotion_record = {
            "emotion": game_emotion,
            "timestamp": datetime.now().isoformat(),
            "raw_emotions": emotions,
            "dominant": dominant_emotion
        }
        session["emotion_history"].append(emotion_record)
        
        # Determine hint strategy
        hint_recommendation = determine_hint_strategy(
            emotion=game_emotion,
            question_id=request.questionId,
            time_spent=request.timeSpent,
            emotion_history=list(session["emotion_history"]),
            hints_already_given=session["hints_given"]
        )
        
        # If hint is being provided, log it
        if hint_recommendation.get("action") == "provide_hint":
            session["hints_given"].append({
                "questionId": request.questionId,
                "hint_level": hint_recommendation["hint_level"],
                "timestamp": datetime.now().isoformat()
            })
        
        return EmotionDetectionResponse(
            emotion=game_emotion,
            raw_emotions=emotions,
            hint_recommendation=hint_recommendation,
            confidence=float(emotions[dominant_emotion])
        )
        
    except Exception as e:
        print(f"Emotion detection error: {str(e)}")
        # Return neutral emotion if detection fails
        return EmotionDetectionResponse(
            emotion="focused",
            raw_emotions={},
            hint_recommendation={"action": "none", "message": "No face detected"},
            confidence=0.0
        )

@app.post("/api/generate-questions")
async def generate_questions(request: QuestionGenerationRequest):
    """Generate coding questions with multi-level hints using Google Gemini"""
    try:
        generated_questions = []
        
        for i in range(request.count):
            prompt = f"""
Generate a coding challenge for the following specifications:

Topic: {request.topic}
Difficulty: {request.difficulty}

Provide the response in the following JSON format (ensure valid JSON):

{{
  "question": "Clear, concise coding problem statement",
  "example_input": "Sample input as string",
  "example_output": "Expected output as string",
  "hint_level_1": "Subtle hint - just a nudge in the right direction",
  "hint_level_2": "Moderate hint - explains the approach without code",
  "hint_level_3": "Detailed hint - step-by-step breakdown",
  "explanation": "Complete solution explanation with reasoning",
  "bonus_challenge": "A harder variation of the same problem",
  "common_mistakes": ["mistake1", "mistake2", "mistake3"],
  "time_complexity": "e.g., O(n)",
  "space_complexity": "e.g., O(1)"
}}

Make the question unique and educational.
"""
            
            # Use global client
            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=2048,
                )
            )
            
            
            # Extract text from response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            # Parse JSON
            question_data = json.loads(response_text.strip())
            
            # Add metadata
            question_data['id'] = generate_unique_id()
            question_data['topic'] = request.topic
            question_data['difficulty'] = request.difficulty
            question_data['created_at'] = datetime.now().isoformat()
            
            # Store in database
            questions_db.append(question_data)
            generated_questions.append(question_data)
        
        return {
            "success": True,
            "count": len(generated_questions),
            "questions": generated_questions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

@app.get("/api/questions")
async def get_questions(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 10
):
    """Get questions from database with optional filtering"""
    filtered_questions = questions_db
    
    if topic:
        filtered_questions = [q for q in filtered_questions if q['topic'].lower() == topic.lower()]
    
    if difficulty:
        filtered_questions = [q for q in filtered_questions if q['difficulty'].lower() == difficulty.lower()]
    
    return {
        "count": len(filtered_questions[:limit]),
        "questions": filtered_questions[:limit]
    }

@app.get("/api/questions/{question_id}")
async def get_question(question_id: str):
    """Get a specific question by ID"""
    question = next((q for q in questions_db if q['id'] == question_id), None)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return question

@app.post("/api/submit-answer")
async def submit_answer(submission: AnswerSubmission):
    """
    Handle answer submission and provide feedback
    """
    # Find question
    question = next((q for q in questions_db if q['id'] == submission.questionId), None)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Get session
    if submission.sessionId not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[submission.sessionId]
    
    # Simple answer checking (in production, use proper test cases)
    is_correct = submission.answer.strip().lower() == question['example_output'].strip().lower()
    
    # Calculate XP based on time and hints used
    base_xp = {"easy": 10, "medium": 15, "hard": 25}.get(question['difficulty'], 10)
    
    hints_used = len([h for h in session['hints_given'] if h['questionId'] == submission.questionId])
    xp_penalty = hints_used * 2
    
    time_bonus = max(0, 5 - int(submission.timeTaken / 30))  # Bonus for quick solving
    
    total_xp = max(base_xp - xp_penalty + time_bonus, 5) if is_correct else 0
    
    # Update session
    if is_correct:
        session['xp'] += total_xp
        session['questions_solved'] += 1
    
    session['questions_attempted'].append({
        "questionId": submission.questionId,
        "correct": is_correct,
        "timeTaken": submission.timeTaken,
        "xp_earned": total_xp,
        "timestamp": datetime.now().isoformat()
    })
    
    return {
        "correct": is_correct,
        "xp_earned": total_xp,
        "total_xp": session['xp'],
        "explanation": question['explanation'] if is_correct else "Try again! Check your logic.",
        "hints_used": hints_used,
        "questions_solved": session['questions_solved']
    }

@app.get("/api/session/{session_id}/stats")
async def get_session_stats(session_id: str):
    """Get statistics for a session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    # Convert emotion history to JSON-serializable format
    emotion_history_list = []
    for emotion_record in session['emotion_history']:
        serializable_record = {
            "emotion": emotion_record["emotion"],
            "timestamp": emotion_record["timestamp"],
            "dominant": emotion_record["dominant"],
            "raw_emotions": {
                k: float(v) for k, v in emotion_record["raw_emotions"].items()
            }
        }
        emotion_history_list.append(serializable_record)
    
    return {
        "sessionId": session_id,
        "total_xp": int(session.get('xp', 0)),
        "questions_solved": int(session.get('questions_solved', 0)),
        "questions_attempted": len(session.get('questions_attempted', [])),
        "hints_used": len(session['hints_given']),
        "emotion_data": {
            "total_checks": len(session['emotion_history']),
            "recent_emotions": emotion_history_list[-10:] if emotion_history_list else []
        }
    }

# ========================================
# Startup Event
# ========================================

# @app.on_event("startup")
# async def startup_event():
#     """Initialize with some sample questions if database is empty"""
#     if len(questions_db) == 0:
#         print("🔄 Database empty. Generate questions using POST /api/generate-questions")
#         print("💡 Example: POST with body {\"topic\": \"arrays\", \"difficulty\": \"easy\", \"count\": 5}")


@app.post("/api/auth/register")
async def register(user: UserCreate):
    """Register a new user"""
    db = await get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "email": user.email,
        "username": user.username,
        "hashed_password": hashed_password,
        "current_level": 1,
        "total_xp": 0,
        "city_restoration_progress": 0,
        "created_at": datetime.now().isoformat(),
        "achievements": []
    }
    
    result = await db.users.insert_one(user_doc)
    
    # Create story progress
    story_doc = {
        "user_id": str(result.inserted_id),
        "current_chapter": 1,
        "completed_chapters": [],
        "city_buildings_restored": [],
        "story_choices": {}
    }
    await db.story_progress.insert_one(story_doc)
    
    # Create stats
    stats_doc = {
        "user_id": str(result.inserted_id),
        "total_questions_attempted": 0,
        "total_questions_solved": 0,
        "total_time_spent": 0,
        "emotion_distribution": {},
        "accuracy_by_difficulty": {},
        "average_time_per_question": 0,
        "streak_days": 0,
        "last_active": datetime.now().isoformat()
    }
    await db.user_stats.insert_one(stats_doc)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(days=7)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "email": user.email,
            "username": user.username
        }
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):
    """Login user"""
    db = await get_database()
    
    user_doc = await db.users.find_one({"email": user.email})
    if not user_doc or not verify_password(user.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(days=7)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user_doc["_id"]),
            "email": user_doc["email"],
            "username": user_doc["username"],
            "current_level": user_doc.get("current_level", 1),
            "total_xp": user_doc.get("total_xp", 0)
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user_email: str = Depends(get_current_user)):
    """Get current user info"""
    db = await get_database()
    user = await db.users.find_one({"email": current_user_email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "current_level": user.get("current_level", 1),
        "total_xp": user.get("total_xp", 0),
        "city_restoration_progress": user.get("city_restoration_progress", 0),
        "achievements": user.get("achievements", [])
    }

# ========================================
# STORY ENDPOINTS
# ========================================

@app.get("/api/story/chapter/{chapter_id}")
async def get_story_chapter(chapter_id: int):
    """Get story chapter content"""
    if chapter_id not in STORY_CHAPTERS:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    return STORY_CHAPTERS[chapter_id]

@app.get("/api/story/progress/{user_id}")
async def get_story_progress(user_id: str):
    """Get user's story progress"""
    db = await get_database()
    progress = await db.story_progress.find_one({"user_id": user_id})
    
    if not progress:
        raise HTTPException(status_code=404, detail="Story progress not found")
    
    current_chapter = STORY_CHAPTERS.get(progress["current_chapter"], STORY_CHAPTERS[1])
    
    return {
        "current_chapter": progress["current_chapter"],
        "chapter_data": current_chapter,
        "completed_chapters": progress["completed_chapters"],
        "city_buildings_restored": progress["city_buildings_restored"],
        "buildings_data": {
            building_id: BUILDINGS[building_id] 
            for building_id in progress["city_buildings_restored"]
        }
    }

@app.post("/api/story/restore-building")
async def restore_building(user_id: str, building_id: str):
    """Restore a building in the city"""
    db = await get_database()
    
    if building_id not in BUILDINGS:
        raise HTTPException(status_code=404, detail="Building not found")
    
    # Update story progress
    result = await db.story_progress.update_one(
        {"user_id": user_id},
        {"$addToSet": {"city_buildings_restored": building_id}}
    )
    
    # Update user's city restoration progress
    progress = await db.story_progress.find_one({"user_id": user_id})
    restoration_percentage = len(progress["city_buildings_restored"]) / len(BUILDINGS) * 100
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"city_restoration_progress": int(restoration_percentage)}}
    )
    
    return {
        "success": True,
        "building": BUILDINGS[building_id],
        "restoration_progress": int(restoration_percentage)
    }

# ========================================
# ANALYTICS ENDPOINTS
# ========================================

@app.get("/api/analytics/{user_id}")
async def get_user_analytics(user_id: str):
    """Get comprehensive user analytics"""
    db = await get_database()
    
    stats = await db.user_stats.find_one({"user_id": user_id})
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if not stats or not user:
        raise HTTPException(status_code=404, detail="User stats not found")
    
    accuracy = (stats["total_questions_solved"] / stats["total_questions_attempted"] * 100) if stats["total_questions_attempted"] > 0 else 0
    
    return {
        "user_info": {
            "username": user["username"],
            "current_level": user["current_level"],
            "total_xp": user["total_xp"],
            "city_restoration": user["city_restoration_progress"]
        },
        "performance": {
            "total_questions_attempted": stats["total_questions_attempted"],
            "total_questions_solved": stats["total_questions_solved"],
            "accuracy": round(accuracy, 2),
            "total_time_spent": stats["total_time_spent"],
            "average_time_per_question": stats["average_time_per_question"]
        },
        "emotion_analysis": stats["emotion_distribution"],
        "difficulty_performance": stats["accuracy_by_difficulty"],
        "streak": stats["streak_days"],
        "achievements": user["achievements"]
    }

# Add to Data Models section in main.py
class AnalyticsUpdate(BaseModel):
    user_id: str
    correct: bool
    time_taken: float
    emotion: str = "focused"

# Then update the endpoint
@app.post("/api/analytics/update")
async def update_analytics(data: AnalyticsUpdate):
    """Update user analytics after question attempt"""
    db = await get_database()
    
    stats = await db.user_stats.find_one({"user_id": data.user_id})
    
    if not stats:
        # Create stats if they don't exist
        stats_doc = {
            "user_id": data.user_id,
            "total_questions_attempted": 0,
            "total_questions_solved": 0,
            "total_time_spent": 0,
            "emotion_distribution": {},
            "accuracy_by_difficulty": {},
            "average_time_per_question": 0,
            "streak_days": 0,
            "last_active": datetime.now().isoformat()
        }
        await db.user_stats.insert_one(stats_doc)
        stats = await db.user_stats.find_one({"user_id": data.user_id})
    
    # Update emotion distribution
    emotion_dist = stats.get("emotion_distribution", {})
    emotion_dist[data.emotion] = emotion_dist.get(data.emotion, 0) + 1
    
    # Calculate new average time
    total_attempted = stats.get("total_questions_attempted", 0) + 1
    total_time = stats.get("total_time_spent", 0) + data.time_taken
    avg_time = total_time / total_attempted if total_attempted > 0 else 0
    
    # Update stats
    await db.user_stats.update_one(
        {"user_id": data.user_id},
        {
            "$inc": {
                "total_questions_attempted": 1,
                "total_questions_solved": 1 if data.correct else 0,
                "total_time_spent": data.time_taken
            },
            "$set": {
                "emotion_distribution": emotion_dist,
                "average_time_per_question": avg_time,
                "last_active": datetime.now().isoformat()
            }
        }
    )
    
    return {"success": True}

# Add this model after other models
class UserXPUpdate(BaseModel):
    user_id: str
    xp_to_add: int

# Add this endpoint
@app.post("/api/user/update-xp")
async def update_user_xp(data: UserXPUpdate):
    """Update user's total XP"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(data.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate new totals
    current_xp = user.get("total_xp", 0)
    new_total_xp = current_xp + data.xp_to_add
    new_level = (new_total_xp // 100) + 1
    
    # Update user
    await db.users.update_one(
        {"_id": ObjectId(data.user_id)},
        {
            "$set": {
                "total_xp": new_total_xp,
                "current_level": new_level
            }
        }
    )
    
    return {
        "success": True,
        "total_xp": new_total_xp,
        "current_level": new_level
    }

@app.get("/api/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Get top users leaderboard"""
    db = await get_database()
    
    users = await db.users.find().sort("total_xp", -1).limit(limit).to_list(length=limit)
    
    leaderboard = []
    for idx, user in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "username": user["username"],
            "level": user["current_level"],
            "xp": user["total_xp"],
            "city_restoration": user["city_restoration_progress"]
        })
    
    return {"leaderboard": leaderboard}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)