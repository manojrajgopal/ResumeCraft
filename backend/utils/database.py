from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
client = None
db = None

async def connect_db():
    global client, db
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable is not set")
    
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.resume_platform
    print("Connected to MongoDB")

async def close_db():
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_db():
    if db is None:
        raise RuntimeError("Database not connected")
    return db

def get_user_collection():
    return get_db().users

def get_resume_collection():
    return get_db().resumes

def get_activity_collection():
    return get_db().activities