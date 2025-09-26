# Apertus-Powered Meeting Chatbot Service

import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from swisshacks.model.swisscom_apertus import client as apertus_client
from app.models.meeting_models import (
    ChatMessage, ChatResponse,
    Meeting, Task, ClientRequest
)


class ChatbotService:
    """AI chatbot service using Apertus for meeting-specific conversations"""
    
    def __init__(self):
        self.client = apertus_client
        self.conversation_history = {}  # Store conversation context per meeting
        
    async def process_message(self, chat_message: ChatMessage, db: Session = None) -> ChatResponse:
        """Process chat message and return AI response with meeting context"""
        
        # Get meeting context if meeting_id is provided
        context = ""
        sources = []
        
        if chat_message.meeting_id and db:
            context = await self._get_meeting_context(chat_message.meeting_id, db)
            sources = [f"Meeting {chat_message.meeting_id} transcript and data"]
        
        # Build conversation prompt with context
        system_prompt = self._build_system_prompt(chat_message.context_type, context)
        
        # Get conversation history for this meeting
        conversation_key = f"meeting_{chat_message.meeting_id}" if chat_message.meeting_id else "general"
        history = self.conversation_history.get(conversation_key, [])
        
        # Prepare messages for Apertus
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 10 messages to avoid token limits)
        messages.extend(history[-10:])
        
        # Add current message
        messages.append({"role": "user", "content": chat_message.message})
        
        try:
            # Call Apertus API
            response = self.client.chat.completions.create(
                model="swiss-ai/Apertus-70B",
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            ai_response = response.choices[0].message.content
            confidence = 0.85  # Apertus typically provides high confidence responses
            
            # Generate suggested actions based on the response
            suggested_actions = await self._generate_suggested_actions(
                chat_message.message, ai_response, chat_message.meeting_id, db
            )
            
            # Update conversation history
            history.extend([
                {"role": "user", "content": chat_message.message},
                {"role": "assistant", "content": ai_response}
            ])
            self.conversation_history[conversation_key] = history
            
            return ChatResponse(
                response=ai_response,
                confidence=confidence,
                sources=sources,
                suggested_actions=suggested_actions
            )
            
        except Exception as e:
            # Fallback response
            return ChatResponse(
                response=f"I apologize, but I'm having trouble processing your request right now. Error: {str(e)}",
                confidence=0.1,
                sources=[],
                suggested_actions=[]
            )
    
    async def _get_meeting_context(self, meeting_id: int, db: Session) -> str:
        """Retrieve comprehensive meeting context for the chatbot"""
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            return "Meeting not found."
        
        # Build context string
        context_parts = []
        
        # Basic meeting info
        context_parts.append(f"Meeting: {meeting.title}")
        context_parts.append(f"Date: {meeting.scheduled_start}")
        context_parts.append(f"Client: {meeting.client_id}")
        context_parts.append(f"Advisor: {meeting.advisor_id}")
        
        if meeting.description:
            context_parts.append(f"Description: {meeting.description}")
        
        # Meeting transcript (truncated if too long)
        if meeting.transcript:
            transcript = meeting.transcript[:2000] + "..." if len(meeting.transcript) > 2000 else meeting.transcript
            context_parts.append(f"Transcript excerpt: {transcript}")
        
        # Meeting summary
        if meeting.summary:
            context_parts.append(f"Summary: {meeting.summary}")
        
        # Tasks
        tasks = db.query(Task).filter(Task.meeting_id == meeting_id).all()
        if tasks:
            context_parts.append("Tasks:")
            for task in tasks[:10]:  # Limit to 10 tasks
                status_emoji = "✅" if task.status == "completed" else "⏳"
                context_parts.append(f"  {status_emoji} {task.title} (Assigned to: {task.assigned_to})")
        
        # Client requests
        requests = db.query(ClientRequest).filter(ClientRequest.meeting_id == meeting_id).all()
        if requests:
            context_parts.append("Client Requests:")
            for request in requests[:5]:  # Limit to 5 requests
                context_parts.append(f"  • {request.description} (Priority: {request.urgency})")
        
        # Meeting documents
        if meeting.documents:
            context_parts.append("Associated Documents:")
            for doc in meeting.documents[:5]:
                context_parts.append(f"  📄 {doc.filename}")
        
        return "\n".join(context_parts)
    
    def _build_system_prompt(self, context_type: str, meeting_context: str = "") -> str:
        """Build system prompt based on context type"""
        
        base_prompt = """You are an AI assistant specializing in banking and financial services, specifically designed to help UBS advisors with client meetings and conversations. You have expertise in:

- Banking products and services
- Client relationship management
- Meeting analysis and insights
- Task and action item tracking
- Swiss banking regulations and practices
- Wealth management and investment advice

You should provide helpful, accurate, and professional responses. When discussing financial matters, always emphasize the importance of personalized advice and regulatory compliance."""
        
        if context_type == "meeting" and meeting_context:
            return f"""{base_prompt}

CURRENT MEETING CONTEXT:
{meeting_context}

Based on this meeting information, help the advisor with questions about:
- Meeting content and discussions
- Action items and follow-ups
- Client requests and needs
- Next steps and recommendations
- Meeting insights and analysis

Always reference specific information from the meeting when relevant."""
        
        elif context_type == "client_history":
            return f"""{base_prompt}

You have access to historical client interaction data. Help the advisor understand:
- Client relationship patterns
- Previous meeting outcomes
- Service usage history
- Potential opportunities
- Risk factors and considerations

{meeting_context if meeting_context else ""}"""
        
        else:  # general
            return f"""{base_prompt}

Provide general assistance with:
- UBS products and services
- Banking best practices
- Meeting preparation tips
- Client communication strategies
- Regulatory compliance guidance"""
    
    async def _generate_suggested_actions(self, user_message: str, ai_response: str, meeting_id: Optional[int], db: Optional[Session]) -> List[str]:
        """Generate suggested actions based on the conversation"""
        suggestions = []
        
        user_lower = user_message.lower()
        
        # Task-related suggestions
        if any(keyword in user_lower for keyword in ["task", "todo", "action", "follow up"]):
            if meeting_id:
                suggestions.append(f"Create a new task for meeting {meeting_id}")
            suggestions.append("Set reminder for this action item")
        
        # Meeting-related suggestions
        if any(keyword in user_lower for keyword in ["meeting", "schedule", "calendar"]):
            suggestions.append("Schedule follow-up meeting")
            suggestions.append("Send meeting invitation")
        
        # Client-related suggestions
        if any(keyword in user_lower for keyword in ["client", "customer", "request"]):
            suggestions.append("Add client note")
            suggestions.append("Update client profile")
            if meeting_id:
                suggestions.append(f"Create client request record for meeting {meeting_id}")
        
        # Document-related suggestions
        if any(keyword in user_lower for keyword in ["document", "file", "report", "statement"]):
            suggestions.append("Upload related document")
            suggestions.append("Generate meeting report")
        
        # Service-related suggestions
        if any(keyword in user_lower for keyword in ["product", "service", "investment", "account"]):
            suggestions.append("Research UBS product information")
            suggestions.append("Prepare service proposal")
        
        return suggestions[:4]  # Limit to 4 suggestions
    
    async def get_meeting_insights(self, meeting_id: int, db: Session) -> ChatResponse:
        """Generate comprehensive meeting insights using AI"""
        
        meeting_context = await self._get_meeting_context(meeting_id, db)
        
        insight_prompt = f"""Analyze this meeting data and provide comprehensive insights:

{meeting_context}

Please provide:
1. Key discussion points summary
2. Client satisfaction indicators
3. Relationship opportunities identified
4. Risk factors or concerns
5. Recommended next steps
6. Meeting effectiveness assessment

Format your response in a structured, professional manner suitable for a UBS advisor."""
        
        try:
            response = self.client.chat.completions.create(
                model="swiss-ai/Apertus-70B",
                messages=[
                    {"role": "system", "content": "You are an expert meeting analyst for UBS. Provide detailed, actionable insights."},
                    {"role": "user", "content": insight_prompt}
                ],
                temperature=0.3,  # Lower temperature for more focused analysis
                max_tokens=1500
            )
            
            insights = response.choices[0].message.content
            
            return ChatResponse(
                response=insights,
                confidence=0.90,
                sources=[f"Meeting {meeting_id} comprehensive analysis"],
                suggested_actions=[
                    "Generate detailed meeting report",
                    "Schedule client follow-up",
                    "Update client risk profile",
                    "Create service proposal"
                ]
            )
            
        except Exception as e:
            return ChatResponse(
                response=f"Unable to generate meeting insights: {str(e)}",
                confidence=0.1,
                sources=[],
                suggested_actions=[]
            )
    
    async def suggest_meeting_preparation(self, client_id: str, meeting_type: str, db: Session) -> ChatResponse:
        """Suggest meeting preparation based on client history"""
        
        # Get client's previous meetings
        previous_meetings = db.query(Meeting).filter(
            Meeting.client_id == client_id,
            Meeting.status == "completed"
        ).order_by(Meeting.actual_end.desc()).limit(3).all()
        
        client_context = f"Client ID: {client_id}\nMeeting Type: {meeting_type}\n"
        
        if previous_meetings:
            client_context += "Recent Meeting History:\n"
            for meeting in previous_meetings:
                client_context += f"- {meeting.title} ({meeting.actual_end.date()}): {meeting.summary or 'No summary'}\n"
        else:
            client_context += "No previous meeting history available.\n"
        
        prep_prompt = f"""As a UBS meeting preparation expert, suggest comprehensive preparation for an upcoming client meeting:

{client_context}

Provide specific recommendations for:
1. Key topics to discuss
2. Documents to prepare
3. Potential service opportunities
4. Questions to ask the client
5. Follow-up items from previous meetings
6. Risk considerations
7. Regulatory compliance checklist

Make suggestions specific to this client's history and the meeting type."""
        
        try:
            response = self.client.chat.completions.create(
                model="swiss-ai/Apertus-70B",
                messages=[
                    {"role": "system", "content": "You are a UBS meeting preparation specialist. Provide detailed, actionable preparation advice."},
                    {"role": "user", "content": prep_prompt}
                ],
                temperature=0.4,
                max_tokens=1200
            )
            
            preparation_advice = response.choices[0].message.content
            
            return ChatResponse(
                response=preparation_advice,
                confidence=0.88,
                sources=[f"Client {client_id} history and best practices"],
                suggested_actions=[
                    "Create meeting agenda",
                    "Prepare client portfolio review",
                    "Schedule pre-meeting team briefing",
                    "Set up required documents"
                ]
            )
            
        except Exception as e:
            return ChatResponse(
                response=f"Unable to generate preparation suggestions: {str(e)}",
                confidence=0.1,
                sources=[],
                suggested_actions=[]
            )
    
    def clear_conversation_history(self, meeting_id: Optional[int] = None):
        """Clear conversation history for a specific meeting or all conversations"""
        if meeting_id:
            conversation_key = f"meeting_{meeting_id}"
            if conversation_key in self.conversation_history:
                del self.conversation_history[conversation_key]
        else:
            self.conversation_history.clear()
    
    def get_conversation_summary(self, meeting_id: int) -> Dict[str, Any]:
        """Get summary of conversation with the chatbot for a meeting"""
        conversation_key = f"meeting_{meeting_id}"
        history = self.conversation_history.get(conversation_key, [])
        
        if not history:
            return {"message": "No conversation history found"}
        
        user_messages = [msg["content"] for msg in history if msg["role"] == "user"]
        assistant_messages = [msg["content"] for msg in history if msg["role"] == "assistant"]
        
        return {
            "meeting_id": meeting_id,
            "total_messages": len(history),
            "user_messages": len(user_messages),
            "assistant_responses": len(assistant_messages),
            "conversation_start": "N/A",  # Would track timestamps in real implementation
            "last_activity": "N/A",
            "topics_discussed": self._extract_topics_from_conversation(user_messages)
        }
    
    def _extract_topics_from_conversation(self, messages: List[str]) -> List[str]:
        """Extract main topics from conversation messages"""
        # Simple keyword-based topic extraction
        topics = set()
        
        keywords = {
            "tasks": ["task", "action", "todo", "follow up"],
            "meetings": ["meeting", "schedule", "calendar", "agenda"],
            "clients": ["client", "customer", "service", "request"],
            "products": ["product", "investment", "account", "portfolio"],
            "reports": ["report", "document", "analysis", "summary"]
        }
        
        for message in messages:
            message_lower = message.lower()
            for topic, topic_keywords in keywords.items():
                if any(keyword in message_lower for keyword in topic_keywords):
                    topics.add(topic)
        
        return list(topics)