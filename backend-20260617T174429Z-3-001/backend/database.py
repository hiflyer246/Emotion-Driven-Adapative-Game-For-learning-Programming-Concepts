import json
import os
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

# Configuration
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

class Collection:
    def __init__(self, name: str):
        self.name = name
        self.file_path = os.path.join(DATA_DIR, f"{name}.json")
        self._load()

    def _load(self):
        if not os.path.exists(self.file_path):
            self.data = []
            self._save()
        else:
            try:
                with open(self.file_path, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
            except json.JSONDecodeError:
                self.data = []

    def _save(self):
        # Convert datetime objects to string for JSON serialization
        # This is a simple implementation; deep conversion might be needed for nested objects
        def serializable(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            return obj
            
        # We need to serialize the whole list, so we might need a custom dumper or pre-process
        # For simplicity, let's assume inserted data is json-serializable or we handle basic types
        # Note: In a real mimicked driver, we'd handle ObjectId wrapping/unwrapping.
        # Here we treat _id as string.
        
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, default=str)

    async def find_one(self, query: Dict[str, Any]):
        self._load() # Ensure fresh data
        for doc in self.data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, query: Dict[str, Any]):
        return Cursor(self, query)

    async def insert_one(self, doc: Dict[str, Any]):
        self._load()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        
        # Convert datetime to string for storage immediately to avoid serialization issues later
        # Or keep as objects in memory and convert on save. 
        # Better to keep consistency: in-memory = mixed (like mongo driver returns), file = json.
        
        self.data.append(doc)
        self._save()
        
        class InsertResult:
            inserted_id = doc["_id"]
        return InsertResult()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        self._load()
        target_idx = -1
        
        # Find document
        for i, doc in enumerate(self.data):
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                target_idx = i
                break
        
        if target_idx != -1:
            doc = self.data[target_idx]
            
            # Handle $set
            if "$set" in update:
                for k, v in update["$set"].items():
                    doc[k] = v
            
            # Handle $addToSet
            if "$addToSet" in update:
                for k, v in update["$addToSet"].items():
                    if k not in doc:
                        doc[k] = []
                    if isinstance(doc[k], list):
                        if v not in doc[k]:
                            doc[k].append(v)
            
            # Handle $push
            if "$push" in update:
                for k, v in update["$push"].items():
                    if k not in doc:
                        doc[k] = []
                    if isinstance(doc[k], list):
                         doc[k].append(v)

            self.data[target_idx] = doc
            self._save()
            return True
            
        return False

class Cursor:
    def __init__(self, collection: Collection, query: Dict[str, Any]):
        self.collection = collection
        self.query = query
        self.sort_key = None
        self.sort_direction = 1

    def sort(self, key, direction=1):
        self.sort_key = key
        self.sort_direction = direction
        return self

    async def to_list(self, length: int = 1000):
        self.collection._load()
        results = []
        for doc in self.collection.data:
            match = True
            for k, v in self.query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        
        if self.sort_key:
            results.sort(key=lambda x: x.get(self.sort_key, ""), reverse=(self.sort_direction == -1))
            
        return results[:length]

class Database:
    def __init__(self):
        self.collections = {}

    def __getattr__(self, name):
        # Allow access like db.users
        return self.get_collection(name)
        
    def __getitem__(self, name):
         return self.get_collection(name)

    def get_collection(self, name):
        if name not in self.collections:
            self.collections[name] = Collection(name)
        return self.collections[name]

db = Database()

async def get_database():
    return db

async def connect_to_mongo():
    print("Using Local JSON Database")

async def close_mongo_connection():
    print("JSON Database 'connection' closed")