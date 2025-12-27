# 🎮 Code Runner: Emotion-Aware Programming Adventure - Backend API

A FastAPI-based backend that uses **DeepFace** for real-time emotion recognition and **Google Gemini AI** to generate adaptive coding challenges with multi-level hints.

---

## 🌟 Features

- 🎭 **Real-time Emotion Detection** - Analyzes facial expressions using DeepFace
- 🤖 **AI-Powered Question Generation** - Creates unique coding challenges with Google Gemini
- 💡 **Progressive Hint System** - Three levels of hints (subtle → moderate → detailed)
- 🎯 **Adaptive Gameplay** - Responds to player emotions (frustrated, confused, bored, etc.)
- 📊 **Session Management** - Tracks player progress, XP, and emotion history
- 🏆 **Bonus Challenges** - Offers harder problems when players are bored
- 💬 **Encouragement System** - Provides emotional support when players struggle

---

## 🛠️ Tech Stack

- **Framework:** FastAPI 0.104.1
- **Emotion Detection:** DeepFace 0.0.79 + OpenCV
- **AI Content Generation:** Google Gemini AI (google-genai 0.2.0)
- **Deep Learning:** TensorFlow 2.15.0
- **Image Processing:** Pillow, NumPy
- **Server:** Uvicorn

---

## 📋 Prerequisites

- Python 3.8 or higher
- Webcam (for emotion detection)
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd code-runner-backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt:**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
deepface==0.0.79
opencv-python==4.8.1.78
tensorflow==2.15.0
pillow==10.1.0
numpy==1.24.3
google-genai==0.2.0
```

### 4. Set Environment Variables

**On macOS/Linux:**
```bash
export GEMINI_API_KEY="your-gemini-api-key-here"
```

**On Windows:**
```cmd
set GEMINI_API_KEY=your-gemini-api-key-here
```

**Or create a `.env` file:**
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 5. Run the Server

```bash
python main.py
```

**Server will start at:** `http://localhost:8000`

**Interactive API Documentation:** `http://localhost:8000/docs`

---

## 📡 API Endpoints

### **1. Health Check**
```http
GET /
```
Returns server status and available endpoints.

**Response:**
```json
{
  "status": "running",
  "service": "Code Runner API",
  "version": "1.0.0"
}
```

---

### **2. Create Session**
```http
POST /api/session/create
```
Creates a new game session for a player.

**Response:**
```json
{
  "sessionId": "session_20251010143052",
  "message": "Session created successfully"
}
```

---

### **3. Generate Questions**
```http
POST /api/generate-questions
```

**Request Body:**
```json
{
  "topic": "arrays",
  "difficulty": "easy",
  "count": 5
}
```

**Parameters:**
- `topic` (string): Programming topic (e.g., "arrays", "loops", "recursion")
- `difficulty` (string): "easy", "medium", or "hard"
- `count` (integer): Number of questions to generate (1-10)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "questions": [
    {
      "id": "q_20251010143052_0",
      "topic": "arrays",
      "difficulty": "easy",
      "question": "Find the largest number in an array",
      "example_input": "[3, 7, 2, 9, 1]",
      "example_output": "9",
      "hint_level_1": "Think about iterating through the array...",
      "hint_level_2": "Keep track of the maximum value as you loop...",
      "hint_level_3": "Initialize max with first element, then compare...",
      "explanation": "Full solution...",
      "bonus_challenge": "Find the second largest number",
      "common_mistakes": ["Not handling empty arrays"],
      "time_complexity": "O(n)",
      "space_complexity": "O(1)"
    }
  ]
}
```

---

### **4. Detect Emotion**
```http
POST /api/detect-emotion
```

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "questionId": "q_20251010143052_0",
  "timeSpent": 45.5,
  "sessionId": "session_20251010143052"
}
```

**Parameters:**
- `image` (string): Base64 encoded webcam frame
- `questionId` (string): Current question ID
- `timeSpent` (float): Seconds spent on current question
- `sessionId` (string): Session ID from `/api/session/create`

**Response:**
```json
{
  "emotion": "frustrated",
  "raw_emotions": {
    "angry": 0.35,
    "disgust": 0.02,
    "fear": 0.05,
    "happy": 0.10,
    "sad": 0.15,
    "surprise": 0.08,
    "neutral": 0.25
  },
  "hint_recommendation": {
    "action": "provide_hint",
    "hint": "You can solve this in one pass by keeping track of the maximum...",
    "hint_level": 2,
    "message": "Let's break this down step by step. 🤗"
  },
  "confidence": 0.35
}
```

**Possible Actions:**
- `provide_hint` - Show hint to player
- `bonus_challenge` - Offer harder problem
- `encouragement` - Show motivational message
- `none` - No intervention needed

---

### **5. Get Questions**
```http
GET /api/questions?topic=arrays&difficulty=easy&limit=10
```

**Query Parameters:**
- `topic` (optional): Filter by topic
- `difficulty` (optional): Filter by difficulty
- `limit` (optional): Max results (default: 10)

**Response:**
```json
{
  "count": 5,
  "questions": [...]
}
```

---

### **6. Get Single Question**
```http
GET /api/questions/{question_id}
```

**Response:**
```json
{
  "id": "q_20251010143052_0",
  "question": "Find the largest number...",
  ...
}
```

---

### **7. Submit Answer**
```http
POST /api/submit-answer
```

**Request Body:**
```json
{
  "sessionId": "session_20251010143052",
  "questionId": "q_20251010143052_0",
  "answer": "9",
  "timeTaken": 45.5
}
```

**Response:**
```json
{
  "correct": true,
  "xp_earned": 13,
  "total_xp": 58,
  "explanation": "Correct! The optimal approach is...",
  "hints_used": 1,
  "questions_solved": 5
}
```

**XP Calculation:**
- Base XP: Easy (10), Medium (15), Hard (25)
- Penalty: -2 XP per hint used
- Time Bonus: +5 XP for quick solve (< 30s)

---

### **8. Get Session Stats**
```http
GET /api/session/{session_id}/stats
```

**Response:**
```json
{
  "sessionId": "session_20251010143052",
  "total_xp": 125,
  "questions_solved": 8,
  "questions_attempted": 10,
  "hints_used": 5,
  "emotion_data": {
    "total_checks": 150,
    "recent_emotions": [...]
  }
}
```

---

## 🎭 Emotion Mapping

DeepFace detects standard emotions and maps them to game-specific emotions:

| DeepFace Emotions | Game Emotion | Trigger Condition |
|-------------------|--------------|-------------------|
| Neutral (+ engaged) | **Focused** | Neutral > 0.5, time < 120s |
| Neutral (+ disengaged) | **Bored** | Neutral > 0.4, time > 180s |
| Angry / Disgust | **Frustrated** | Angry > 0.3 OR Disgust > 0.3 |
| Fear / Surprise | **Confused** | Fear > 0.2 OR Surprise > 0.3 |
| Happy | **Happy** | Happy > 0.5 |
| Sad | **Sad** | Sad > 0.4 |

---

## 💡 Hint Strategy

### Progressive Hint System

| Emotion | Duration | Action | Hint Level |
|---------|----------|--------|------------|
| **Frustrated** | 15s | First hint | Level 1 (subtle) |
| **Frustrated** | 30s | Second hint | Level 2 (moderate) |
| **Frustrated** | 45s | Third hint | Level 3 (detailed) |
| **Confused** | 20s | First hint | Level 1 |
| **Confused** | 45s | Second hint | Level 2 |
| **Bored** | 20s | Bonus challenge | N/A |
| **Sad** | 10s | Encouragement + hint | Level 1 |
| **Happy/Focused** | N/A | No intervention | None |

---

## 🧪 Testing the API

### Using cURL

**1. Create Session:**
```bash
curl -X POST http://localhost:8000/api/session/create
```

**2. Generate Questions:**
```bash
curl -X POST http://localhost:8000/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "arrays",
    "difficulty": "easy",
    "count": 3
  }'
```

**3. Get Questions:**
```bash
curl http://localhost:8000/api/questions
```

**4. Test Emotion Detection:**
```bash
curl -X POST http://localhost:8000/api/detect-emotion \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,YOUR_BASE64_IMAGE",
    "questionId": "q_001",
    "timeSpent": 45.5,
    "sessionId": "session_001"
  }'
```

### Using Swagger UI

Navigate to: `http://localhost:8000/docs`

Interactive API documentation with built-in testing interface.

---

## 📁 Project Structure

```
code-runner-backend/
│
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── .env                   # Environment variables (create this)
│
└── venv/                  # Virtual environment (created during setup)
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Server port (default: 8000) | No |
| `HOST` | Server host (default: 0.0.0.0) | No |

### CORS Settings

By default, CORS is configured for React frontend at `http://localhost:3000`.

To modify, edit in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🐛 Troubleshooting

### Issue: "No face detected"
**Solution:** Ensure:
- Webcam is working and enabled
- Good lighting conditions
- Face is clearly visible to camera
- Image is properly base64 encoded

### Issue: "GEMINI_API_KEY not found"
**Solution:**
```bash
export GEMINI_API_KEY="your-key-here"
# Or add to .env file
```

### Issue: DeepFace takes too long
**Solution:**
- Use `detector_backend='opencv'` (faster, less accurate)
- Or use `detector_backend='retinaface'` (slower, more accurate)
- Reduce image resolution before sending