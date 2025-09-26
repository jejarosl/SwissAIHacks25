# Outlook Integration Service for Meeting Management

import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json

# Microsoft Graph API integration
try:
    from azure.identity import ClientSecretCredential
    from msgraph import GraphServiceClient
    from msgraph.generated.models.event import Event
    from msgraph.generated.models.date_time_time_zone import DateTimeTimeZone
    from msgraph.generated.models.location import Location
    from msgraph.generated.models.attendee import Attendee
    from msgraph.generated.models.email_address import EmailAddress
    GRAPH_AVAILABLE = True
except ImportError:
    print("Warning: Microsoft Graph SDK not available. Install with: pip install azure-identity msgraph-sdk")
    GRAPH_AVAILABLE = False

from app.models.meeting_models import Meeting, MeetingCreate


class OutlookService:
    """Service for integrating with Microsoft Outlook and Teams"""
    
    def __init__(self):
        self.graph_client = None
        
        if GRAPH_AVAILABLE:
            # Initialize Microsoft Graph client
            tenant_id = os.getenv("AZURE_TENANT_ID")
            client_id = os.getenv("AZURE_CLIENT_ID") 
            client_secret = os.getenv("AZURE_CLIENT_SECRET")
            
            if tenant_id and client_id and client_secret:
                credential = ClientSecretCredential(
                    tenant_id=tenant_id,
                    client_id=client_id,
                    client_secret=client_secret
                )
                self.graph_client = GraphServiceClient(credentials=credential)
            else:
                print("Warning: Azure credentials not configured for Outlook integration")
    
    async def sync_meeting(self, meeting: Meeting) -> Dict[str, Any]:
        """Sync meeting with Outlook calendar"""
        if not self.graph_client:
            return {"error": "Graph client not available"}
        
        try:
            if meeting.outlook_id:
                # Update existing event
                return await self._update_outlook_event(meeting)
            else:
                # Create new event
                return await self._create_outlook_event(meeting)
                
        except Exception as e:
            return {"error": f"Failed to sync with Outlook: {str(e)}"}
    
    async def _create_outlook_event(self, meeting: Meeting) -> Dict[str, Any]:
        """Create a new Outlook calendar event"""
        try:
            # Create event object
            event = Event()
            event.subject = meeting.title
            event.body_preview = meeting.description or ""
            
            # Set start time
            event.start = DateTimeTimeZone()
            event.start.date_time = meeting.scheduled_start.isoformat()
            event.start.time_zone = "UTC"
            
            # Set end time
            event.end = DateTimeTimeZone()
            event.end.date_time = meeting.scheduled_end.isoformat()
            event.end.time_zone = "UTC"
            
            # Set location if provided
            if meeting.location:
                event.location = Location()
                event.location.display_name = meeting.location
            
            # Add attendees (in real implementation, get from meeting participants)
            event.attendees = []
            
            # Add client as attendee
            client_attendee = Attendee()
            client_attendee.email_address = EmailAddress()
            client_attendee.email_address.address = f"{meeting.client_id}@ubs.com"  # Mock email
            client_attendee.email_address.name = f"Client {meeting.client_id}"
            event.attendees.append(client_attendee)
            
            # Add advisor as attendee
            advisor_attendee = Attendee()
            advisor_attendee.email_address = EmailAddress()
            advisor_attendee.email_address.address = f"{meeting.advisor_id}@ubs.com"  # Mock email
            advisor_attendee.email_address.name = f"Advisor {meeting.advisor_id}"
            event.attendees.append(advisor_attendee)
            
            # Add Teams meeting if online
            if meeting.meeting_type == "online":
                # In real implementation, use Graph API to create Teams meeting
                event.is_online_meeting = True
                event.online_meeting_provider = "teamsForBusiness"
            
            # Create the event
            # Note: This would require proper Graph API setup and permissions
            # created_event = await self.graph_client.me.events.post(event)
            
            # Mock response for now
            mock_outlook_id = f"outlook_{meeting.id}_{datetime.utcnow().timestamp()}"
            
            return {
                "success": True,
                "outlook_id": mock_outlook_id,
                "message": "Meeting created in Outlook calendar",
                "meeting_url": f"https://teams.microsoft.com/meeting/{mock_outlook_id}" if meeting.meeting_type == "online" else None
            }
            
        except Exception as e:
            return {"error": f"Failed to create Outlook event: {str(e)}"}
    
    async def _update_outlook_event(self, meeting: Meeting) -> Dict[str, Any]:
        """Update existing Outlook calendar event"""
        try:
            # In real implementation, update the existing event
            # event = await self.graph_client.me.events.by_event_id(meeting.outlook_id).get()
            # Update event properties
            # await self.graph_client.me.events.by_event_id(meeting.outlook_id).patch(event)
            
            return {
                "success": True,
                "outlook_id": meeting.outlook_id,
                "message": "Meeting updated in Outlook calendar"
            }
            
        except Exception as e:
            return {"error": f"Failed to update Outlook event: {str(e)}"}
    
    async def get_calendar_events(self, user_id: str, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get calendar events for a user within date range"""
        if not self.graph_client:
            return []
        
        try:
            # In real implementation:
            # events = await self.graph_client.users.by_user_id(user_id).calendar.events.get()
            
            # Mock response
            mock_events = [
                {
                    "id": "event_1",
                    "subject": "Client Review Meeting",
                    "start": start_date.isoformat(),
                    "end": (start_date + timedelta(hours=1)).isoformat(),
                    "location": "Conference Room A",
                    "attendees": ["client@example.com", "advisor@ubs.com"]
                },
                {
                    "id": "event_2", 
                    "subject": "Portfolio Discussion",
                    "start": (start_date + timedelta(days=1)).isoformat(),
                    "end": (start_date + timedelta(days=1, hours=1)).isoformat(),
                    "location": "Online",
                    "attendees": ["client2@example.com", "advisor@ubs.com"]
                }
            ]
            
            return mock_events
            
        except Exception as e:
            print(f"Error fetching calendar events: {e}")
            return []
    
    async def create_teams_meeting(self, meeting: Meeting) -> Dict[str, Any]:
        """Create a Teams meeting for the scheduled meeting"""
        if not self.graph_client:
            return {"error": "Graph client not available"}
        
        try:
            # In real implementation, create Teams meeting
            # This requires Microsoft Graph API calls to create online meetings
            
            mock_meeting_url = f"https://teams.microsoft.com/l/meetup-join/{meeting.id}"
            mock_meeting_id = f"teams_{meeting.id}_{datetime.utcnow().timestamp()}"
            
            return {
                "success": True,
                "meeting_url": mock_meeting_url,
                "meeting_id": mock_meeting_id,
                "dial_in_numbers": ["+1-555-0123", "+41-44-555-0123"],
                "conference_id": f"CONF{meeting.id}"
            }
            
        except Exception as e:
            return {"error": f"Failed to create Teams meeting: {str(e)}"}
    
    async def send_meeting_invitation(self, meeting: Meeting, additional_attendees: List[str] = []) -> Dict[str, Any]:
        """Send meeting invitation to attendees"""
        if not self.graph_client:
            return {"error": "Graph client not available"}
        
        try:
            # In real implementation, send email invitations
            attendee_list = [
                f"{meeting.client_id}@ubs.com",
                f"{meeting.advisor_id}@ubs.com"
            ] + additional_attendees
            
            return {
                "success": True,
                "invitations_sent": len(attendee_list),
                "attendees": attendee_list,
                "message": "Meeting invitations sent successfully"
            }
            
        except Exception as e:
            return {"error": f"Failed to send invitations: {str(e)}"}
    
    async def get_user_availability(self, user_email: str, start_time: datetime, end_time: datetime) -> Dict[str, Any]:
        """Check user availability for meeting scheduling"""
        if not self.graph_client:
            return {"error": "Graph client not available"}
        
        try:
            # In real implementation, check user's calendar for availability
            # Use Graph API's findMeetingTimes or getSchedule endpoints
            
            # Mock availability response
            time_slots = []
            current_time = start_time
            
            while current_time < end_time:
                # Simulate some busy periods
                is_busy = (current_time.hour >= 10 and current_time.hour <= 11) or \
                         (current_time.hour >= 14 and current_time.hour <= 15)
                
                time_slots.append({
                    "start": current_time.isoformat(),
                    "end": (current_time + timedelta(hours=1)).isoformat(),
                    "status": "busy" if is_busy else "free"
                })
                
                current_time += timedelta(hours=1)
            
            return {
                "user_email": user_email,
                "time_period": {
                    "start": start_time.isoformat(),
                    "end": end_time.isoformat()
                },
                "availability": time_slots,
                "suggested_times": [slot for slot in time_slots if slot["status"] == "free"][:3]
            }
            
        except Exception as e:
            return {"error": f"Failed to check availability: {str(e)}"}
    
    async def schedule_follow_up_meeting(self, original_meeting: Meeting, follow_up_days: int = 7) -> Dict[str, Any]:
        """Automatically schedule a follow-up meeting"""
        if not self.graph_client:
            return {"error": "Graph client not available"}
        
        try:
            # Calculate follow-up meeting time
            follow_up_start = original_meeting.scheduled_end + timedelta(days=follow_up_days)
            follow_up_end = follow_up_start + timedelta(hours=1)
            
            # Create follow-up meeting data
            follow_up_meeting = MeetingCreate(
                client_id=original_meeting.client_id,
                advisor_id=original_meeting.advisor_id,
                title=f"Follow-up: {original_meeting.title}",
                description=f"Follow-up meeting to discuss outcomes from {original_meeting.title}",
                scheduled_start=follow_up_start,
                scheduled_end=follow_up_end,
                location=original_meeting.location,
                meeting_type=original_meeting.meeting_type
            )
            
            return {
                "success": True,
                "follow_up_meeting": follow_up_meeting.dict(),
                "message": f"Follow-up meeting scheduled for {follow_up_start.strftime('%Y-%m-%d %H:%M')}"
            }
            
        except Exception as e:
            return {"error": f"Failed to schedule follow-up: {str(e)}"}
    
    async def get_meeting_analytics(self, user_id: str, days_back: int = 30) -> Dict[str, Any]:
        """Get meeting analytics for a user"""
        if not self.graph_client:
            return {"error": "Graph client not available"}
        
        try:
            # In real implementation, analyze user's calendar data
            
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days_back)
            
            # Mock analytics
            return {
                "user_id": user_id,
                "analysis_period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                    "days": days_back
                },
                "meeting_stats": {
                    "total_meetings": 25,
                    "client_meetings": 18,
                    "internal_meetings": 7,
                    "online_meetings": 15,
                    "in_person_meetings": 10,
                    "average_duration_minutes": 65,
                    "total_meeting_hours": 27.1
                },
                "productivity_insights": [
                    "Most productive meeting times: 9-11 AM",
                    "Average meeting preparation time: 15 minutes",
                    "Meeting completion rate: 92%",
                    "Most common meeting type: Client review"
                ],
                "recommendations": [
                    "Consider blocking 30-minute prep time before client meetings",
                    "Schedule follow-up meetings immediately after client meetings",
                    "Optimize meeting frequency for better client engagement"
                ]
            }
            
        except Exception as e:
            return {"error": f"Failed to get analytics: {str(e)}"}
    
    def format_meeting_for_outlook(self, meeting: Dict[str, Any]) -> str:
        """Format meeting data for Outlook integration"""
        
        meeting_info = f"""
📅 {meeting.get('title', 'Meeting')}
📍 {meeting.get('location', 'TBD')}
🕐 {meeting.get('start_time', 'TBD')} - {meeting.get('end_time', 'TBD')}

📋 Agenda:
{meeting.get('description', 'No description provided')}

👥 Attendees:
- Client: {meeting.get('client_id', 'TBD')}
- Advisor: {meeting.get('advisor_id', 'TBD')}

🎯 Objectives:
{meeting.get('objectives', 'To be determined')}

📝 Preparation Notes:
{meeting.get('preparation_notes', 'Standard client meeting preparation')}
        """.strip()
        
        return meeting_info


# Utility functions for meeting scheduling
class MeetingSchedulingHelper:
    """Helper class for intelligent meeting scheduling"""
    
    @staticmethod
    def suggest_optimal_meeting_times(
        attendees: List[str], 
        duration_minutes: int = 60,
        days_ahead: int = 7,
        preferred_hours: List[int] = [9, 10, 11, 14, 15, 16]
    ) -> List[Dict[str, Any]]:
        """Suggest optimal meeting times based on attendee availability"""
        
        suggestions = []
        base_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for day_offset in range(1, days_ahead + 1):
            current_date = base_date + timedelta(days=day_offset)
            
            # Skip weekends
            if current_date.weekday() >= 5:
                continue
            
            for hour in preferred_hours:
                start_time = current_date.replace(hour=hour)
                end_time = start_time + timedelta(minutes=duration_minutes)
                
                # Simple availability check (in real implementation, check actual calendars)
                availability_score = MeetingSchedulingHelper._calculate_availability_score(
                    start_time, attendees
                )
                
                suggestions.append({
                    "start_time": start_time,
                    "end_time": end_time,
                    "availability_score": availability_score,
                    "attendees_available": len(attendees),  # Mock: assume all available
                    "confidence": availability_score * 0.8,
                    "day_of_week": start_time.strftime("%A"),
                    "time_slot": f"{hour:02d}:00-{(hour + duration_minutes//60):02d}:00"
                })
        
        # Sort by availability score
        suggestions.sort(key=lambda x: x["availability_score"], reverse=True)
        
        return suggestions[:5]  # Return top 5 suggestions
    
    @staticmethod
    def _calculate_availability_score(meeting_time: datetime, attendees: List[str]) -> float:
        """Calculate availability score for a meeting time"""
        # Simple scoring algorithm
        score = 1.0
        
        # Prefer mid-morning and early afternoon
        hour = meeting_time.hour
        if 9 <= hour <= 11:
            score += 0.3
        elif 14 <= hour <= 16:
            score += 0.2
        
        # Slight preference for Tuesday-Thursday
        weekday = meeting_time.weekday()
        if 1 <= weekday <= 3:  # Tuesday-Thursday
            score += 0.1
        
        # Avoid very early or very late
        if hour < 8 or hour > 17:
            score -= 0.5
        
        return min(score, 1.0)
    
    @staticmethod
    def generate_meeting_agenda(meeting_type: str, client_context: Dict[str, Any]) -> List[str]:
        """Generate meeting agenda based on type and client context"""
        
        base_agenda = [
            "Welcome and introductions",
            "Review of previous meeting outcomes"
        ]
        
        if meeting_type == "portfolio_review":
            base_agenda.extend([
                "Current portfolio performance analysis",
                "Market outlook discussion",
                "Risk assessment and adjustments",
                "New investment opportunities",
                "Rebalancing recommendations"
            ])
        elif meeting_type == "onboarding":
            base_agenda.extend([
                "Client needs assessment",
                "Service offerings overview",
                "Account setup and documentation",
                "Risk profile determination",
                "Initial investment strategy"
            ])
        elif meeting_type == "follow_up":
            base_agenda.extend([
                "Action items from previous meeting",
                "Status updates on ongoing initiatives", 
                "New client questions or concerns",
                "Service satisfaction review"
            ])
        else:  # general
            base_agenda.extend([
                "Current service review",
                "Client questions and concerns",
                "New opportunities discussion",
                "Relationship management updates"
            ])
        
        base_agenda.extend([
            "Next steps and action items",
            "Schedule follow-up meeting",
            "Meeting wrap-up"
        ])
        
        return base_agenda