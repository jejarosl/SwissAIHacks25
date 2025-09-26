# Backend API Models for Meeting System

from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class MeetingStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ModelType(str, Enum):
    APERTUS = "apertus"
    AZURE_OPENAI = "azure_openai"
    ON_DEVICE = "on_device"

# Database Models
class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, index=True)
    advisor_id = Column(String, index=True)
    title = Column(String)
    description = Column(Text)
    scheduled_start = Column(DateTime)
    scheduled_end = Column(DateTime)
    actual_start = Column(DateTime)
    actual_end = Column(DateTime)
    status = Column(String, default=MeetingStatus.SCHEDULED)
    location = Column(String)
    meeting_type = Column(String)  # online, in_person, hybrid
    outlook_id = Column(String)  # For Outlook integration
    transcript = Column(Text)
    summary = Column(Text)
    confidence_score = Column(Float)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="meeting")
    participants = relationship("MeetingParticipant", back_populates="meeting")
    documents = relationship("MeetingDocument", back_populates="meeting")

class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    participant_id = Column(String)
    participant_name = Column(String)
    participant_email = Column(String)
    role = Column(String)  # advisor, client, observer
    speaker_id = Column(String)  # For speaker identification
    
    meeting = relationship("Meeting", back_populates="participants")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    title = Column(String)
    description = Column(Text)
    assigned_to = Column(String)
    status = Column(String, default=TaskStatus.PENDING)
    priority = Column(String)  # low, medium, high, urgent
    due_date = Column(DateTime)
    completion_date = Column(DateTime)
    extracted_by_model = Column(String)  # Which AI model extracted this task
    confidence_score = Column(Float)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    meeting = relationship("Meeting", back_populates="tasks")

class ClientRequest(Base):
    __tablename__ = "client_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    client_id = Column(String)
    request_type = Column(String)  # service_inquiry, complaint, information_request
    description = Column(Text)
    urgency = Column(String)  # low, medium, high
    status = Column(String)  # new, in_progress, resolved, escalated
    extracted_text = Column(Text)  # Original text from transcript
    confidence_score = Column(Float)
    extracted_by_model = Column(String)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class MeetingDocument(Base):
    __tablename__ = "meeting_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    filename = Column(String)
    file_path = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    uploaded_by = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    meeting = relationship("Meeting", back_populates="documents")

# Pydantic Models for API
class MeetingBase(BaseModel):
    client_id: str
    advisor_id: str
    title: str
    description: Optional[str] = None
    scheduled_start: datetime
    scheduled_end: datetime
    location: Optional[str] = None
    meeting_type: str = "online"

class MeetingCreate(MeetingBase):
    outlook_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[MeetingStatus] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    confidence_score: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class MeetingResponse(MeetingBase):
    id: int
    status: MeetingStatus
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    tasks: List["TaskResponse"] = []
    participants: List["ParticipantResponse"] = []
    documents: List["DocumentResponse"] = []
    
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: str
    priority: str = "medium"
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    meeting_id: int
    extracted_by_model: Optional[str] = None
    confidence_score: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    meeting_id: int
    status: TaskStatus
    completion_date: Optional[datetime] = None
    extracted_by_model: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ClientRequestBase(BaseModel):
    client_id: str
    request_type: str
    description: str
    urgency: str = "medium"

class ClientRequestCreate(ClientRequestBase):
    meeting_id: int
    extracted_text: Optional[str] = None
    confidence_score: Optional[float] = None
    extracted_by_model: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ClientRequestResponse(ClientRequestBase):
    id: int
    meeting_id: int
    status: str
    extracted_text: Optional[str] = None
    confidence_score: Optional[float] = None
    extracted_by_model: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ParticipantBase(BaseModel):
    participant_id: str
    participant_name: str
    participant_email: Optional[str] = None
    role: str

class ParticipantCreate(ParticipantBase):
    meeting_id: int
    speaker_id: Optional[str] = None

class ParticipantResponse(ParticipantBase):
    id: int
    meeting_id: int
    speaker_id: Optional[str] = None
    
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    filename: str
    file_type: str
    file_size: int
    uploaded_by: str
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    meeting_id: int
    file_path: str

class DocumentResponse(DocumentBase):
    id: int
    meeting_id: int
    file_path: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Real-time transcription models
class TranscriptionSegment(BaseModel):
    start_time: float
    end_time: float
    text: str
    speaker_id: Optional[str] = None
    confidence: float
    language: Optional[str] = None

class TranscriptionUpdate(BaseModel):
    meeting_id: int
    segments: List[TranscriptionSegment]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Pre-meeting preparation models
class ClientContext(BaseModel):
    client_id: str
    client_name: str
    previous_meetings: List[Dict[str, Any]]
    active_services: List[str]
    suggested_services: List[str]
    contract_details: Dict[str, Any]
    risk_profile: str
    last_interaction: Optional[datetime] = None

class MeetingPreparation(BaseModel):
    meeting_id: int
    client_context: ClientContext
    agenda_suggestions: List[str]
    potential_discussion_points: List[str]
    required_documents: List[str]
    
# Model switching and extraction
class ExtractionRequest(BaseModel):
    meeting_id: int
    text: str
    model_type: ModelType
    extract_tasks: bool = True
    extract_requests: bool = True
    extract_sentiment: bool = False
    language: str = "auto"

class ExtractionResult(BaseModel):
    meeting_id: int
    model_used: str
    processing_time: float
    tasks: List[TaskCreate] = []
    requests: List[ClientRequestCreate] = []
    sentiment_score: Optional[float] = None
    confidence_score: float
    metadata: Dict[str, Any] = {}

# Chatbot models
class ChatMessage(BaseModel):
    meeting_id: Optional[int] = None
    message: str
    context_type: str = "meeting"  # meeting, client_history, general

class ChatResponse(BaseModel):
    response: str
    confidence: float
    sources: List[str] = []
    suggested_actions: List[str] = []