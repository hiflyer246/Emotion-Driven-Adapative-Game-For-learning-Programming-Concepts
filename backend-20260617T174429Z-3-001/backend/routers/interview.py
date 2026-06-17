from fastapi import APIRouter, UploadFile, File, HTTPException, Body, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import base64
import uuid

# Services
from services.interview_bot import interview_bot
from services.speech_service import speech_service
from services.emotion_service import emotion_service
from services.resume_parser import resume_parser
from database import get_database
from auth import get_current_user
from fastapi import Depends, Form

router = APIRouter(prefix="/api/interview", tags=["interview"])


class InterviewStartRequest(BaseModel):
    topic: str = "General Software Engineering"
    difficulty: str = "medium"
    user_id: str

class TTSRequest(BaseModel):
    text: str

class EmotionFrameRequest(BaseModel):
    session_id: str
    image: str # base64

class InterviewResponseRequest(BaseModel):
    session_id: str
    answer_text: str

@router.post("/start")
async def start_interview(request: InterviewStartRequest, current_user: str = Depends(get_current_user)):
    """Initializes a new interview session and returns the introductory question/greeting."""
    db = await get_database()
    
    # Get real user ID
    user = await db.users.find_one({"email": current_user})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    real_user_id = str(user["_id"])
    session_id = str(uuid.uuid4())
    
    # Generate initial greeting/question
    context = []
    # Force a greeting start
    initial_prompt = "Hello! I'm your AI interviewer. I'll be conducting a technical interview on " + request.topic + ". Let's start with a simple question. Tell me about yourself and your experience with " + request.topic + "."
    
    # Or use Gemini to generate one
    q_data = await interview_bot.generate_question(request.topic, request.difficulty, context, emotion="neutral")
    # For start, maybe override or use the generated one
    
    session_data = {
        "session_id": session_id,
        "user_id": real_user_id,
        "start_time": datetime.now(),
        "topic": request.topic,
        "difficulty": request.difficulty,
        "history": [], # stores Q&A turns
        "emotion_log": [],
        "current_question": q_data
    }
    
    db = await get_database()
    await db.interview_sessions.insert_one(session_data)
    
    # Generate audio for the question
    audio_bytes = await speech_service.text_to_speech(q_data.get("question_text", "Ready?"))
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

    return {
        "session_id": session_id,
        "message": "Interview started",
        "question": q_data,
        "audio": audio_base64
    }

@router.post("/start-with-resume")
async def start_interview_with_resume(
    resume: UploadFile = File(...),
    topic: str = Form(...),
    difficulty: str = Form("medium"),
    current_user: str = Depends(get_current_user)
):
    """Initializes a new interview session with resume context."""
    db = await get_database()
    
    # Get real user ID
    user = await db.users.find_one({"email": current_user})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    real_user_id = str(user["_id"])
    session_id = str(uuid.uuid4())

    # Parse Resume
    resume_text = await resume_parser.extract_text_from_file(resume)
    
    # Generate initial question with resume context
    context = []
    q_data = await interview_bot.generate_question(topic, difficulty, context, emotion="neutral", resume_context=resume_text)
    
    session_data = {
        "session_id": session_id,
        "user_id": real_user_id,
        "start_time": datetime.now(),
        "topic": topic,
        "difficulty": difficulty,
        "history": [], 
        "emotion_log": [],
        "current_question": q_data,
        "resume_text": resume_text
    }
    
    await db.interview_sessions.insert_one(session_data)
    
    # Generate audio for the question
    audio_bytes = await speech_service.text_to_speech(q_data.get("question_text", "Ready?"))
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

    return {
        "session_id": session_id,
        "message": "Interview started with resume",
        "question": q_data,
        "audio": audio_base64
    }

@router.post("/process-frame")
async def process_frame(request: EmotionFrameRequest, current_user: str = Depends(get_current_user)):
    """Receives video frames to log emotion state."""
    db = await get_database()
    session = await db.interview_sessions.find_one({"session_id": request.session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    result = emotion_service.detect_emotion(request.image)
    
    new_log_entry = {
        "timestamp": datetime.now().isoformat(),
        "emotion": result["emotion"],
        "confidence": result["confidence"]
    }
    
    await db.interview_sessions.update_one(
        {"session_id": request.session_id},
        {"$push": {"emotion_log": new_log_entry}}
    )
    
    return {"status": "processed", "emotion": result["emotion"]}
    
    return {"status": "processed", "emotion": result["emotion"]}

@router.post("/submit-response")
async def submit_response(
    request: InterviewResponseRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Receives user text response.
    1. Analyze Answer (Gemini)
    2. Determine Next Question (Gemini + Emotion)
    3. TTS Next Question
    4. Return JSON + Audio
    """
    db = await get_database()
    session = await db.interview_sessions.find_one({"session_id": request.session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 1. Use provided text
    user_text = request.answer_text
    
    if not user_text:
        user_text = "(No answer provided)"

    # 2. Analyze Response
    last_question = session["current_question"]["question_text"]
    analysis = await interview_bot.analyze_response(last_question, user_text)
    
    # Save turn
    turn_data = {
        "question": session["current_question"],
        "answer_text": user_text,
        "analysis": analysis,
        "timestamp": datetime.now().isoformat()
    }
    
    await db.interview_sessions.update_one(
        {"session_id": request.session_id},
        {"$push": {"history": turn_data}}
    )
    
    # Update local session object for context usage
    session["history"].append(turn_data)

    # 3. Generate Next Question
    # Get recent emotion
    recent_emotion = "neutral"
    if session["emotion_log"]:
        recent_emotion = session["emotion_log"][-1]["emotion"]
        
    next_q_data = await interview_bot.generate_question(
        session["topic"], 
        session["difficulty"], 
        session["history"], 
        recent_emotion,
        session.get("resume_text")
    )
    
    await db.interview_sessions.update_one(
        {"session_id": request.session_id},
        {"$set": {"current_question": next_q_data}}
    )
    
    # 4. TTS
    bot_text = ""
    if analysis.get("feedback"):
         # Optionally add short feedback before next question
         # bot_text += f"{analysis['feedback']} " # Might be too verbose
         pass
         
    bot_text += next_q_data["question_text"]
    
    audio_bytes = await speech_service.text_to_speech(bot_text)
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    return {
        "user_transcript": user_text,
        "feedback": analysis,
        "next_question": next_q_data,
        "audio": audio_base64
    }

@router.get("/history")
async def get_interview_history(current_user: str = Depends(get_current_user)):
    """Get all interview sessions for the current user."""
    db = await get_database()
    
    # Get user object to get ID (since current_user is email string from auth logic usually)
    # Actually current_user is just email string based on auth.py lines 32-42
    user = await db.users.find_one({"email": current_user})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_id = str(user["_id"])
    
    # Sort by start_time desc
    cursor = db.interview_sessions.find({"user_id": user_id}).sort("start_time", -1)
    sessions = await cursor.to_list(length=50)
    
    history_data = []
    for session in sessions:
        history_data.append({
            "session_id": session["session_id"],
            "topic": session.get("topic", "General"),
            "difficulty": session.get("difficulty", "medium"),
            "start_time": session["start_time"].isoformat() if isinstance(session["start_time"], datetime) else session["start_time"],
            "turns_count": len(session.get("history", []))
        })
        
    return history_data

@router.get("/report/{session_id}")
async def get_report(session_id: str, current_user: str = Depends(get_current_user)):
    db = await get_database()
    session = await db.interview_sessions.find_one({"session_id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "topic": session["topic"],
        "history": session["history"],
        "emotion_log": session["emotion_log"],
        "total_turns": len(session["history"])
    }

@router.post("/tts")
async def text_to_speech_endpoint(request: TTSRequest, current_user: str = Depends(get_current_user)):
    """Generates audio for arbitrary text (used for frontend interventions)."""
    audio_bytes = await speech_service.text_to_speech(request.text)
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    return {"audio": audio_base64}
