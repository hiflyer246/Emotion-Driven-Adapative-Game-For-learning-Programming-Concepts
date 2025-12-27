from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "code_runner_db"

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
db = Database()

async def get_database():
    return db.client[DATABASE_NAME]

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGODB_URL)
    print("Connected to MongoDB")

async def close_mongo_connection():
    db.client.close()
    print("Closed MongoDB connection")