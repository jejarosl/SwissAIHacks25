# Meeting Service - Business logic for meeting operations

import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.meeting_models import (
    Meeting, Task, ClientRequest, MeetingDocument,
    MeetingCreate, MeetingUpdate, MeetingResponse,
    ClientContext, MeetingPreparation,
    MeetingStatus, TaskStatus
)


class MeetingService:
    def __init__(self, db: Session):
        self.db = db

    async def create_meeting(self, meeting_data: MeetingCreate) -> Meeting:
        """Create a new meeting"""
        db_meeting = Meeting(
            **meeting_data.dict(),
            status=MeetingStatus.SCHEDULED,
            created_at=datetime.utcnow()
        )
        
        self.db.add(db_meeting)
        self.db.commit()
        self.db.refresh(db_meeting)
        
        return db_meeting

    async def update_meeting(self, meeting_id: int, meeting_update: MeetingUpdate) -> Meeting:
        """Update an existing meeting"""
        meeting = self.db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise ValueError("Meeting not found")
        
        update_data = meeting_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(meeting, field, value)
        
        meeting.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(meeting)
        
        return meeting

    async def prepare_meeting(self, meeting_id: int) -> MeetingPreparation:
        """Prepare meeting with client context and suggestions"""
        meeting = self.db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise ValueError("Meeting not found")
        
        # Get client context
        client_context = await self._get_client_context(meeting.client_id)
        
        # Generate agenda suggestions based on client history
        agenda_suggestions = await self._generate_agenda_suggestions(client_context)
        
        # Generate discussion points
        discussion_points = await self._generate_discussion_points(client_context)
        
        # Determine required documents
        required_documents = await self._get_required_documents(client_context)
        
        return MeetingPreparation(
            meeting_id=meeting_id,
            client_context=client_context,
            agenda_suggestions=agenda_suggestions,
            potential_discussion_points=discussion_points,
            required_documents=required_documents
        )

    async def _get_client_context(self, client_id: str) -> ClientContext:
        """Get comprehensive client context for meeting preparation"""
        # Get previous meetings
        previous_meetings = self.db.query(Meeting).filter(
            Meeting.client_id == client_id,
            Meeting.status == MeetingStatus.COMPLETED
        ).order_by(desc(Meeting.actual_end)).limit(5).all()
        
        previous_meetings_data = []
        for meeting in previous_meetings:
            previous_meetings_data.append({
                "id": meeting.id,
                "title": meeting.title,
                "date": meeting.actual_end.isoformat() if meeting.actual_end else None,
                "summary": meeting.summary,
                "tasks_completed": len([t for t in meeting.tasks if t.status == TaskStatus.COMPLETED]),
                "total_tasks": len(meeting.tasks)
            })
        
        # Mock data for services and contracts (in real implementation, fetch from UBS systems)
        active_services = [
            "Current Account",
            "Savings Account",
            "Credit Card",
            "Investment Portfolio"
        ]
        
        suggested_services = [
            "Mortgage Advisory",
            "Wealth Management",
            "Insurance Products",
            "Business Banking"
        ]
        
        contract_details = {
            "account_type": "Premium",
            "relationship_manager": "John Smith",
            "portfolio_value": 500000,
            "credit_rating": "A+",
            "kyc_status": "Compliant"
        }
        
        last_interaction = previous_meetings[0].actual_end if previous_meetings else None
        
        return ClientContext(
            client_id=client_id,
            client_name=f"Client {client_id}",  # In real implementation, fetch from client DB
            previous_meetings=previous_meetings_data,
            active_services=active_services,
            suggested_services=suggested_services,
            contract_details=contract_details,
            risk_profile="Conservative",
            last_interaction=last_interaction
        )

    async def _generate_agenda_suggestions(self, client_context: ClientContext) -> List[str]:
        """Generate agenda suggestions based on client context"""
        suggestions = [
            "Review recent portfolio performance",
            "Discuss upcoming financial goals",
            "Review risk tolerance and investment strategy"
        ]
        
        # Add service-specific suggestions
        if "Investment Portfolio" in client_context.active_services:
            suggestions.append("Portfolio rebalancing discussion")
        
        if "Mortgage Advisory" in client_context.suggested_services:
            suggestions.append("Explore mortgage options")
        
        # Add follow-ups from previous meetings
        if client_context.previous_meetings:
            last_meeting = client_context.previous_meetings[0]
            if last_meeting.get("tasks_completed", 0) < last_meeting.get("total_tasks", 0):
                suggestions.append("Follow up on pending action items")
        
        return suggestions

    async def _generate_discussion_points(self, client_context: ClientContext) -> List[str]:
        """Generate potential discussion points"""
        points = [
            "Market outlook and economic trends",
            "Tax optimization strategies",
            "Estate planning considerations",
            "Risk management review"
        ]
        
        # Add personalized points based on client profile
        if client_context.contract_details.get("portfolio_value", 0) > 1000000:
            points.append("High net worth services and opportunities")
        
        if client_context.risk_profile == "Conservative":
            points.append("Capital preservation strategies")
        elif client_context.risk_profile == "Aggressive":
            points.append("Growth investment opportunities")
        
        return points

    async def _get_required_documents(self, client_context: ClientContext) -> List[str]:
        """Determine required documents based on client context"""
        documents = [
            "Latest portfolio statement",
            "Identity verification documents",
            "Risk profile assessment"
        ]
        
        # Add specific documents based on services
        if "Mortgage Advisory" in client_context.suggested_services:
            documents.extend([
                "Income verification",
                "Property valuation documents",
                "Credit history report"
            ])
        
        if "Wealth Management" in client_context.suggested_services:
            documents.extend([
                "Tax returns (last 3 years)",
                "Estate planning documents",
                "Insurance policy details"
            ])
        
        return documents

    async def generate_report(self, meeting_id: int) -> str:
        """Generate comprehensive meeting report"""
        meeting = self.db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise ValueError("Meeting not found")
        
        # In real implementation, use a PDF generation library like ReportLab
        report_content = f"""
        MEETING REPORT
        ==============
        
        Meeting: {meeting.title}
        Date: {meeting.actual_start}
        Duration: {self._calculate_duration(meeting)}
        Participants: {len(meeting.participants)}
        
        SUMMARY:
        {meeting.summary or 'No summary available'}
        
        ACTION ITEMS:
        """
        
        for task in meeting.tasks:
            status_emoji = "✓" if task.status == TaskStatus.COMPLETED else "○"
            report_content += f"\n{status_emoji} {task.title} (Due: {task.due_date})"
        
        report_content += f"""
        
        CLIENT REQUESTS:
        """
        
        for request in self.db.query(ClientRequest).filter(ClientRequest.meeting_id == meeting_id).all():
            report_content += f"\n• {request.description} (Priority: {request.urgency})"
        
        # Save report to file
        os.makedirs("reports", exist_ok=True)
        report_path = f"reports/meeting_{meeting_id}_report.pdf"
        
        # In real implementation, generate actual PDF
        with open(report_path.replace('.pdf', '.txt'), 'w') as f:
            f.write(report_content)
        
        return report_path

    def _calculate_duration(self, meeting: Meeting) -> str:
        """Calculate meeting duration"""
        if meeting.actual_start and meeting.actual_end:
            duration = meeting.actual_end - meeting.actual_start
            hours = duration.seconds // 3600
            minutes = (duration.seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return "Duration not available"

    async def get_analytics(self, meeting_id: int) -> Dict[str, Any]:
        """Get meeting analytics and insights"""
        meeting = self.db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise ValueError("Meeting not found")
        
        # Calculate various metrics
        total_tasks = len(meeting.tasks)
        completed_tasks = len([t for t in meeting.tasks if t.status == TaskStatus.COMPLETED])
        completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        
        # Get client requests
        client_requests = self.db.query(ClientRequest).filter(
            ClientRequest.meeting_id == meeting_id
        ).all()
        
        # Calculate confidence scores
        avg_confidence = sum([r.confidence_score for r in client_requests if r.confidence_score]) / len(client_requests) if client_requests else 0
        
        return {
            "meeting_id": meeting_id,
            "duration_minutes": self._get_duration_minutes(meeting),
            "task_completion_rate": completion_rate,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": total_tasks - completed_tasks,
            "client_requests_count": len(client_requests),
            "average_confidence_score": avg_confidence,
            "transcript_length": len(meeting.transcript) if meeting.transcript else 0,
            "participant_count": len(meeting.participants),
            "documents_uploaded": len(meeting.documents)
        }

    def _get_duration_minutes(self, meeting: Meeting) -> int:
        """Get meeting duration in minutes"""
        if meeting.actual_start and meeting.actual_end:
            duration = meeting.actual_end - meeting.actual_start
            return duration.seconds // 60
        return 0