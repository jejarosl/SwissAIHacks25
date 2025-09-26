# Meeting API Endpoints

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import get_db
from app.models.meeting_models import (
    Meeting, Task, ClientRequest, MeetingParticipant, MeetingDocument,
    MeetingCreate, MeetingUpdate, MeetingResponse,
    TaskCreate, TaskUpdate, TaskResponse,
    ClientRequestCreate, ClientRequestResponse,
    ParticipantCreate, ParticipantResponse,
    DocumentCreate, DocumentResponse,
    TranscriptionUpdate, TranscriptionSegment,
    ClientContext, MeetingPreparation,
    ExtractionRequest, ExtractionResult,
    ChatMessage, ChatResponse,
    MeetingStatus, TaskStatus, ModelType
)
from app.services.meeting_service import MeetingService
from app.services.transcription_service import TranscriptionService
from app.services.extraction_service import ExtractionService
from app.services.chatbot_service import ChatbotService
from app.services.outlook_service import OutlookService

router = APIRouter(prefix="/meetings", tags=["meetings"])

# WebSocket connection manager for real-time features
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Meeting CRUD endpoints
@router.post("/", response_model=MeetingResponse)
async def create_meeting(
    meeting: MeetingCreate,
    db: Session = Depends(get_db)
):
    """Create a new meeting"""
    meeting_service = MeetingService(db)
    return await meeting_service.create_meeting(meeting)

@router.get("/", response_model=List[MeetingResponse])
async def get_meetings(
    advisor_id: Optional[str] = None,
    client_id: Optional[str] = None,
    status: Optional[MeetingStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get meetings with optional filtering"""
    query = db.query(Meeting)
    
    if advisor_id:
        query = query.filter(Meeting.advisor_id == advisor_id)
    if client_id:
        query = query.filter(Meeting.client_id == client_id)
    if status:
        query = query.filter(Meeting.status == status)
    if start_date:
        query = query.filter(Meeting.scheduled_start >= start_date)
    if end_date:
        query = query.filter(Meeting.scheduled_end <= end_date)
    
    meetings = query.offset(skip).limit(limit).all()
    return meetings

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """Get a specific meeting by ID"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: int,
    meeting_update: MeetingUpdate,
    db: Session = Depends(get_db)
):
    """Update a meeting"""
    meeting_service = MeetingService(db)
    return await meeting_service.update_meeting(meeting_id, meeting_update)

@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """Delete a meeting"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully"}

# Pre-meeting preparation endpoints
@router.get("/{meeting_id}/preparation", response_model=MeetingPreparation)
async def get_meeting_preparation(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """Get pre-meeting preparation data"""
    meeting_service = MeetingService(db)
    return await meeting_service.prepare_meeting(meeting_id)

@router.post("/{meeting_id}/sync-outlook")
async def sync_with_outlook(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """Sync meeting with Outlook calendar"""
    outlook_service = OutlookService()
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return await outlook_service.sync_meeting(meeting)

# Real-time transcription endpoints
@router.websocket("/{meeting_id}/transcription")
async def transcription_websocket(
    websocket: WebSocket,
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time transcription"""
    await manager.connect(websocket)
    transcription_service = TranscriptionService()
    
    try:
        while True:
            # Receive audio data from client
            audio_data = await websocket.receive_bytes()
            
            # Process transcription
            transcription = await transcription_service.transcribe_audio(
                audio_data, meeting_id
            )
            
            # Send transcription back to client
            await websocket.send_json({
                "type": "transcription",
                "data": transcription.dict()
            })
            
            # Broadcast to other participants
            await manager.broadcast(f"New transcription for meeting {meeting_id}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/{meeting_id}/transcription/upload")
async def upload_audio_file(
    meeting_id: int,
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload audio file for batch transcription"""
    transcription_service = TranscriptionService()
    
    # Save uploaded file
    file_path = f"uploads/audio/{meeting_id}_{audio_file.filename}"
    with open(file_path, "wb") as buffer:
        content = await audio_file.read()
        buffer.write(content)
    
    # Process transcription
    result = await transcription_service.transcribe_file(file_path, meeting_id)
    
    return {"message": "Audio file processed", "transcription": result}

# Task management endpoints
@router.get("/{meeting_id}/tasks", response_model=List[TaskResponse])
async def get_meeting_tasks(
    meeting_id: int,
    status: Optional[TaskStatus] = None,
    db: Session = Depends(get_db)
):
    """Get tasks for a specific meeting"""
    query = db.query(Task).filter(Task.meeting_id == meeting_id)
    
    if status:
        query = query.filter(Task.status == status)
    
    return query.all()

@router.post("/{meeting_id}/tasks", response_model=TaskResponse)
async def create_task(
    meeting_id: int,
    task: TaskCreate,
    db: Session = Depends(get_db)
):
    """Create a new task for a meeting"""
    db_task = Task(**task.dict(), meeting_id=meeting_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    if task_update.status == TaskStatus.COMPLETED and not task.completion_date:
        task.completion_date = datetime.utcnow()
    
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

# Client request endpoints
@router.get("/{meeting_id}/requests", response_model=List[ClientRequestResponse])
async def get_meeting_requests(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """Get client requests for a specific meeting"""
    return db.query(ClientRequest).filter(ClientRequest.meeting_id == meeting_id).all()

@router.post("/{meeting_id}/requests", response_model=ClientRequestResponse)
async def create_client_request(
    meeting_id: int,
    request: ClientRequestCreate,
    db: Session = Depends(get_db)
):
    """Create a new client request"""
    db_request = ClientRequest(**request.dict(), meeting_id=meeting_id)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

# AI extraction endpoints
@router.post("/{meeting_id}/extract", response_model=ExtractionResult)
async def extract_insights(
    meeting_id: int,
    extraction_request: ExtractionRequest,
    db: Session = Depends(get_db)
):
    """Extract tasks and client requests from meeting text using AI"""
    extraction_service = ExtractionService()
    return await extraction_service.extract_insights(extraction_request)

@router.post("/{meeting_id}/switch-model")
async def switch_ai_model(
    meeting_id: int,
    model_type: ModelType,
    db: Session = Depends(get_db)
):
    """Switch AI model for meeting processing"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    extraction_service = ExtractionService()
    await extraction_service.switch_model(model_type)
    
    return {"message": f"Switched to {model_type.value} model for meeting {meeting_id}"}

# Document management endpoints
@router.post("/{meeting_id}/documents", response_model=DocumentResponse)
async def upload_meeting_document(
    meeting_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = None,
    uploaded_by: str = "system",
    db: Session = Depends(get_db)
):
    """Upload a document associated with a meeting"""
    # Save file
    file_path = f"uploads/documents/{meeting_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create document record
    document = MeetingDocument(
        meeting_id=meeting_id,
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=len(content),
        uploaded_by=uploaded_by,
        description=description
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@router.get("/{meeting_id}/documents", response_model=List[DocumentResponse])
async def get_meeting_documents(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """Get all documents for a meeting"""
    return db.query(MeetingDocument).filter(MeetingDocument.meeting_id == meeting_id).all()

@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Download a meeting document"""
    document = db.query(MeetingDocument).filter(MeetingDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return FileResponse(
        path=document.file_path,
        filename=document.filename,
        media_type='application/octet-stream'
    )

# Chatbot endpoints
@router.post("/{meeting_id}/chat", response_model=ChatResponse)
async def chat_with_meeting_context(
    meeting_id: int,
    chat_message: ChatMessage,
    db: Session = Depends(get_db)
):
    """Chat with AI assistant using meeting context"""
    chatbot_service = ChatbotService()
    chat_message.meeting_id = meeting_id
    return await chatbot_service.process_message(chat_message)

# Report generation endpoints
@router.post("/{meeting_id}/report/generate")
async def generate_meeting_report(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """Generate PDF report for a meeting"""
    meeting_service = MeetingService(db)
    report_path = await meeting_service.generate_report(meeting_id)
    
    return {"message": "Report generated", "file_path": report_path}

@router.get("/{meeting_id}/report/download")
async def download_meeting_report(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """Download meeting report PDF"""
    report_path = f"reports/meeting_{meeting_id}_report.pdf"
    return FileResponse(
        path=report_path,
        filename=f"meeting_{meeting_id}_report.pdf",
        media_type='application/pdf'
    )

# Analytics and evaluation endpoints
@router.get("/{meeting_id}/analytics")
async def get_meeting_analytics(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """Get analytics for a meeting"""
    meeting_service = MeetingService(db)
    return await meeting_service.get_analytics(meeting_id)

@router.post("/evaluate")
async def evaluate_extraction_performance(
    test_data: List[dict],
    model_type: ModelType,
    db: Session = Depends(get_db)
):
    """Evaluate model performance on test dataset"""
    extraction_service = ExtractionService()
    return await extraction_service.evaluate_performance(test_data, model_type)