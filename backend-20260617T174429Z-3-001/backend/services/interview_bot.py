import google.generativeai as genai
import os
import json
from datetime import datetime

class InterviewBotService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "AIzaSyBByEpPVvUEfqgfs8exhJJZGRwFxVTTJ8w")
        if not self.api_key:
             # Fallback for dev if env not set, though it should be
             raise ValueError("GEMINI_API_KEY not found in environment variables") 
        
        genai.configure(api_key=self.api_key)
        # Using a model variable to easily switch if needed
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash") 

    def _get_model(self):
        return genai.GenerativeModel(self.model_name)

    async def generate_question(self, topic: str, difficulty: str, context: list = None, emotion: str = "neutral", resume_context: str = None):
        """
        Generates the next interview question based on history, emotion, and optional resume.
        """
        context_str = ""
        if context:
            # Summarize last few turns
            last_turns = context[-3:] 
            context_str = f"Previous conversation: {json.dumps(last_turns)}"

        resume_prompt = ""
        if resume_context:
            resume_prompt = f"Candidate Resume Details:\n{resume_context}\n\nIMPORTANT: Use the candidate's resume to ask relevant questions matching their experience."

        prompt = f"""
        You are an expert technical interviewer.
        Topic: {topic}
        Difficulty: {difficulty}
        Candidate's Current Emotion: {emotion}
        {resume_prompt}
        {context_str}

        Task: Generate the next interview question.
        - If the user is anxious/nervous, make the question encouraging or slightly easier/behavioral to build confidence.
        - If the user is confident, increase the challenge.
        - If the user is confused, clarify or ask a simpler foundational question.
        - If resume details are provided, prioritize questions about their specific skills and projects.
        
        Output JSON:
        {{
            "question_text": "The actual question to ask",
            "question_type": "technical" | "behavioral" | "system_design",
            "difficulty_level": "easy" | "medium" | "hard",
            "suggested_hints": ["hint1", "hint2"]
        }}
        """
        
        try:
            model = self._get_model()
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error generating question: {e}")
            return {
                "question_text": "COULD NOT GENERATE QUESTION. Please describe your experience with this topic.",
                "question_type": "behavioral",
                "difficulty_level": "easy"
            }

    async def analyze_response(self, question: str, answer: str):
        """
        Analyzes the candidate's answer.
        """
        prompt = f"""
        Question: {question}
        Candidate Answer: {answer}

        Task: Evaluate the answer.
        Output JSON:
        {{
            "is_correct": true | false,
            "rating": 1-10,
            "feedback": "Constructive feedback for the candidate",
            "is_complete": true | false,
            "sentiment": "positive" | "neutral" | "negative",
            "improvement_tip": "One specific tip"
        }}
        """
        try:
            model = self._get_model()
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error analyzing response: {e}")
            return {"feedback": "Analysis failed.", "rating": 5}

interview_bot = InterviewBotService()
