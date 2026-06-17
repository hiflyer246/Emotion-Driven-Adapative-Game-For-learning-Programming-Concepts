import asyncio
import os
import sys
import google.generativeai as genai
import json
from datetime import datetime

# Add parent directory to path to import database modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import connect_to_mongo, close_mongo_connection, get_database
from dotenv import load_dotenv

load_dotenv()

async def generate_and_save_questions():
    print("🚀 Starting Question Population Script...")
    
    api_key = "AIzaSyBByEpPVvUEfqgfs8exhJJZGRwFxVTTJ8w"
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in .env")
        return

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')

    # Topics to generate for
    # Covering all topics from frontend constants.js
    topics_list = [
        'arrays', 'strings', 'loops', 'recursion', 
        'sorting', 'searching', 'dynamic-programming'
    ]
    
    generation_plan = []
    
    for topic in topics_list:
        generation_plan.append({"name": topic, "difficulty": "easy"})
        generation_plan.append({"name": topic, "difficulty": "medium"})
        # Add hard for advanced topics
        if topic in ['recursion', 'dynamic-programming', 'sorting']:
             generation_plan.append({"name": topic, "difficulty": "hard"})

    await connect_to_mongo()
    db = await get_database()

    total_generated = 0

    for item in generation_plan:
        print(f"Generating questions for {item['name']} ({item['difficulty']})...")
        
        prompt = f"""
        Generate 2 unique coding challenges for:
        Topic: {item['name']}
        Difficulty: {item['difficulty']}

        Provide the response as a JSON array of objects. Each object must follow this format:
        {{
          "question": "Problem statement",
          "example_input": "Input",
          "example_output": "Output",
          "hint_level_1": "Hint 1",
          "hint_level_2": "Hint 2",
          "hint_level_3": "Hint 3",
          "explanation": "Solution explanation",
          "bonus_challenge": "Bonus",
          "common_mistakes": ["mistake 1"],
          "time_complexity": "O(n)",
          "space_complexity": "O(1)"
        }}
        """

        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )
            
            questions = json.loads(response.text)
            
            for q in questions:
                q['id'] = f"q_{datetime.now().strftime('%Y%m%d%H%M%S')}_{total_generated}"
                q['topic'] = item['name'].lower()
                q['difficulty'] = item['difficulty']
                q['created_at'] = datetime.now().isoformat()
                
                await db.questions.insert_one(q)
                total_generated += 1
                
            print(f"✅ Saved {len(questions)} questions.")

        except Exception as e:
            print(f"❌ Failed to generate: {e}")

    await close_mongo_connection()
    print(f"🎉 Done! Total questions generated: {total_generated}")

if __name__ == "__main__":
    asyncio.run(generate_and_save_questions())
