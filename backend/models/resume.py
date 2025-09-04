from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    summary: str
    title: str = ""

class Experience(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    company: str
    period: str
    description: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Education(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    degree: str
    institution: str
    period: str
    description: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# resume.py - Update the ResumeVersion model
class ResumeVersion(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    version_name: str
    personal_info: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    projects: List[dict] = []  # Add this
    certificates: List[dict] = []  # Add this
    achievements: List[dict] = []  # Add this
    links: List[dict] = []  # Add this
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# resume.py - Update the create and update models
class ResumeCreate(BaseModel):
    version_name: str
    personal_info: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    projects: List[dict] = []
    certificates: List[dict] = []
    achievements: List[dict] = []
    links: List[dict] = []

class ResumeUpdate(BaseModel):
    version_name: Optional[str] = None
    personal_info: Optional[PersonalInfo] = None
    experience: Optional[List[Experience]] = None
    education: Optional[List[Education]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[dict]] = None
    certificates: Optional[List[dict]] = None
    achievements: Optional[List[dict]] = None
    links: Optional[List[dict]] = None

class ResumeResponse(ResumeVersion):
    pass

class ActivityLog(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    activity_type: str  # 'created', 'updated', 'downloaded', etc.
    resume_id: Optional[PyObjectId] = None
    details: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ActivityResponse(BaseModel):
    id: str
    user_id: str
    activity_type: str
    resume_id: Optional[str] = None
    details: str
    created_at: datetime

    class Config:
        json_encoders = {ObjectId: str}