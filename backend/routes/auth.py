from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from models.user import UserCreate, UserResponse, UserInDB
from utils.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils.database import get_user_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def format_user(user: dict) -> dict:
    """Format MongoDB user document for UserResponse"""
    # Handle both MongoDB documents (_id) and Pydantic models (id)
    user_id = user.get("_id") or user.get("id")
    if isinstance(user_id, ObjectId):
        user_id = str(user_id)
    
    return {
        "id": user_id,
        "full_name": user.get("full_name"),
        "email": user.get("email"),
        "created_at": user.get("created_at") or datetime.utcnow(),
        "updated_at": user.get("updated_at") or datetime.utcnow()
    }

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    user_collection = get_user_collection()
    
    # Check if user already exists
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    user_in_db = UserInDB(**user_dict)
    result = await user_collection.insert_one(user_in_db.dict(by_alias=True))
    
    # Fetch new user and format for response
    new_user = await user_collection.find_one({"_id": result.inserted_id})
    return UserResponse(**format_user(new_user))

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_collection = get_user_collection()
    
    user = await user_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**format_user(user))
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    # Directly return the UserResponse from the current_user
    return UserResponse(
        id=str(current_user.id),
        full_name=current_user.full_name,
        email=current_user.email,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )