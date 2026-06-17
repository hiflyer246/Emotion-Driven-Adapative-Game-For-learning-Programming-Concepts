import asyncio
import json
import os
import sys
from bson import ObjectId
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import connect_to_mongo, close_mongo_connection, get_database
from dotenv import load_dotenv

load_dotenv()

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

async def export_data():
    print("🚀 Starting Data Export...")
    
    try:
        await connect_to_mongo()
        db = await get_database()
        
        # Collections to export
        collections = {
            "questions": "questions.json",
            "users": "users.json",
            "interview_sessions": "interview_sessions.json",
            "story_progress": "story_progress.json",
            "user_stats": "user_stats.json"
        }
        
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
        os.makedirs(data_dir, exist_ok=True)
        
        for col_name, filename in collections.items():
            print(f"Exporting {col_name}...")
            cursor = db[col_name].find({})
            documents = await cursor.to_list(length=10000)
            
            # Clean Documents (convert _id to str id if needed, or keep as string)
            cleaned_docs = []
            for doc in documents:
                # Ensure _id is stored as string 'id' or preserved as string '_id'
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                cleaned_docs.append(doc)
            
            file_path = os.path.join(data_dir, filename)
            with open(file_path, "w", encoding='utf-8') as f:
                json.dump(cleaned_docs, f, cls=JSONEncoder, indent=2)
            
            print(f"✅ Saved {col_name} to {filename} ({len(cleaned_docs)} records)")
            
    except Exception as e:
        print(f"❌ Export failed: {e}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(export_data())
