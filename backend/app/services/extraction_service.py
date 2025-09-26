# Enhanced Multi-Model Extraction Service

import os
import time
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from enum import Enum

# Import existing models from swisshacks package
from swisshacks.model.swisscom_apertus import client as apertus_client
from swisshacks.model.openai_based_model import OpenAIBasedModel
from swisshacks.model.hf_apertus import HFApertusModel

from app.models.meeting_models import (
    ExtractionRequest, ExtractionResult,
    TaskCreate, ClientRequestCreate,
    ModelType
)


class ExtractionService:
    def __init__(self):
        self.current_model = ModelType.APERTUS
        self.models = {
            ModelType.APERTUS: ApertusExtractor(),
            ModelType.AZURE_OPENAI: AzureOpenAIExtractor(),
            ModelType.ON_DEVICE: OnDeviceExtractor()
        }
        
    async def extract_insights(self, request: ExtractionRequest) -> ExtractionResult:
        """Extract tasks and client requests from meeting text"""
        start_time = time.time()
        
        # Get the appropriate model
        extractor = self.models[request.model_type]
        
        # Extract information based on request parameters
        tasks = []
        requests = []
        sentiment_score = None
        
        if request.extract_tasks:
            tasks = await extractor.extract_tasks(request.text, request.language)
        
        if request.extract_requests:
            requests = await extractor.extract_client_requests(request.text, request.language)
        
        if request.extract_sentiment:
            sentiment_score = await extractor.extract_sentiment(request.text, request.language)
        
        processing_time = time.time() - start_time
        
        # Calculate overall confidence score
        confidence_scores = []
        if tasks:
            confidence_scores.extend([task.confidence_score for task in tasks if task.confidence_score])
        if requests:
            confidence_scores.extend([req.confidence_score for req in requests if req.confidence_score])
        
        overall_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        
        return ExtractionResult(
            meeting_id=request.meeting_id,
            model_used=request.model_type.value,
            processing_time=processing_time,
            tasks=tasks,
            requests=requests,
            sentiment_score=sentiment_score,
            confidence_score=overall_confidence,
            metadata={
                "language_detected": request.language,
                "text_length": len(request.text),
                "extraction_timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def switch_model(self, model_type: ModelType):
        """Switch the active AI model"""
        if model_type not in self.models:
            raise ValueError(f"Model type {model_type} not supported")
        
        self.current_model = model_type
        print(f"Switched to {model_type.value} model")
    
    async def evaluate_performance(self, test_data: List[dict], model_type: ModelType) -> Dict[str, Any]:
        """Evaluate model performance on test dataset"""
        extractor = self.models[model_type]
        
        total_samples = len(test_data)
        correct_tasks = 0
        correct_requests = 0
        total_processing_time = 0
        
        task_precision_scores = []
        task_recall_scores = []
        request_precision_scores = []
        request_recall_scores = []
        
        for sample in test_data:
            start_time = time.time()
            
            # Extract with model
            predicted_tasks = await extractor.extract_tasks(sample['text'], sample.get('language', 'auto'))
            predicted_requests = await extractor.extract_client_requests(sample['text'], sample.get('language', 'auto'))
            
            processing_time = time.time() - start_time
            total_processing_time += processing_time
            
            # Compare with ground truth
            ground_truth_tasks = sample.get('expected_tasks', [])
            ground_truth_requests = sample.get('expected_requests', [])
            
            # Calculate precision and recall for tasks
            if ground_truth_tasks:
                task_precision, task_recall = self._calculate_precision_recall(
                    predicted_tasks, ground_truth_tasks, 'tasks'
                )
                task_precision_scores.append(task_precision)
                task_recall_scores.append(task_recall)
            
            # Calculate precision and recall for requests
            if ground_truth_requests:
                request_precision, request_recall = self._calculate_precision_recall(
                    predicted_requests, ground_truth_requests, 'requests'
                )
                request_precision_scores.append(request_precision)
                request_recall_scores.append(request_recall)
        
        # Calculate averages
        avg_task_precision = sum(task_precision_scores) / len(task_precision_scores) if task_precision_scores else 0
        avg_task_recall = sum(task_recall_scores) / len(task_recall_scores) if task_recall_scores else 0
        avg_request_precision = sum(request_precision_scores) / len(request_precision_scores) if request_precision_scores else 0
        avg_request_recall = sum(request_recall_scores) / len(request_recall_scores) if request_recall_scores else 0
        
        # Calculate F1 scores
        task_f1 = 2 * (avg_task_precision * avg_task_recall) / (avg_task_precision + avg_task_recall) if (avg_task_precision + avg_task_recall) > 0 else 0
        request_f1 = 2 * (avg_request_precision * avg_request_recall) / (avg_request_precision + avg_request_recall) if (avg_request_precision + avg_request_recall) > 0 else 0
        
        return {
            "model_type": model_type.value,
            "total_samples": total_samples,
            "avg_processing_time_per_sample": total_processing_time / total_samples,
            "task_metrics": {
                "precision": avg_task_precision,
                "recall": avg_task_recall,
                "f1_score": task_f1
            },
            "request_metrics": {
                "precision": avg_request_precision,
                "recall": avg_request_recall,
                "f1_score": request_f1
            },
            "overall_f1": (task_f1 + request_f1) / 2,
            "evaluation_timestamp": datetime.utcnow().isoformat()
        }
    
    def _calculate_precision_recall(self, predicted: List, ground_truth: List, item_type: str) -> tuple:
        """Calculate precision and recall for predictions"""
        if not predicted and not ground_truth:
            return 1.0, 1.0
        if not predicted:
            return 0.0, 0.0
        if not ground_truth:
            return 0.0, 1.0
        
        # Simple string matching (in real implementation, use semantic similarity)
        predicted_texts = [item.title if item_type == 'tasks' else item.description for item in predicted]
        ground_truth_texts = [item['title'] if item_type == 'tasks' else item['description'] for item in ground_truth]
        
        true_positives = 0
        for pred_text in predicted_texts:
            for gt_text in ground_truth_texts:
                if self._texts_similar(pred_text, gt_text):
                    true_positives += 1
                    break
        
        precision = true_positives / len(predicted_texts) if predicted_texts else 0
        recall = true_positives / len(ground_truth_texts) if ground_truth_texts else 0
        
        return precision, recall
    
    def _texts_similar(self, text1: str, text2: str, threshold: float = 0.7) -> bool:
        """Simple text similarity check (in real implementation, use semantic similarity)"""
        # Simple word overlap similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return False
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        similarity = len(intersection) / len(union)
        return similarity >= threshold


class BaseExtractor:
    """Base class for all extraction models"""
    
    async def extract_tasks(self, text: str, language: str = "auto") -> List[TaskCreate]:
        raise NotImplementedError
    
    async def extract_client_requests(self, text: str, language: str = "auto") -> List[ClientRequestCreate]:
        raise NotImplementedError
    
    async def extract_sentiment(self, text: str, language: str = "auto") -> float:
        raise NotImplementedError


class ApertusExtractor(BaseExtractor):
    """Extractor using Swisscom Apertus model"""
    
    def __init__(self):
        self.client = apertus_client
    
    async def extract_tasks(self, text: str, language: str = "auto") -> List[TaskCreate]:
        """Extract action items using Apertus model"""
        prompt = f"""
        Analyze the following meeting transcript and extract all action items and tasks mentioned.
        For each task, provide:
        1. A clear title
        2. A description 
        3. Who is responsible (if mentioned)
        4. Priority level (high/medium/low)
        5. Due date (if mentioned)
        
        Return the results in JSON format.
        
        Transcript:
        {text}
        """
        
        response = self.client.chat.completions.create(
            model="swiss-ai/Apertus-70B",
            messages=[
                {"role": "system", "content": "You are an expert at analyzing meeting transcripts and extracting actionable tasks. Always respond in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
        )
        
        try:
            # Parse the response and convert to TaskCreate objects
            response_text = response.choices[0].message.content
            tasks_data = json.loads(response_text)
            
            tasks = []
            for task_data in tasks_data.get('tasks', []):
                task = TaskCreate(
                    title=task_data.get('title', 'Untitled Task'),
                    description=task_data.get('description', ''),
                    assigned_to=task_data.get('assigned_to', 'Unassigned'),
                    priority=task_data.get('priority', 'medium'),
                    due_date=self._parse_due_date(task_data.get('due_date')),
                    extracted_by_model="apertus",
                    confidence_score=0.85,  # Apertus typically has high confidence
                    metadata={
                        "language": language,
                        "extraction_method": "apertus_direct"
                    }
                )
                tasks.append(task)
            
            return tasks
            
        except json.JSONDecodeError:
            # Fallback: create a single task from the response
            return [TaskCreate(
                title="Follow up on meeting discussion",
                description=f"Action item extracted from: {text[:200]}...",
                assigned_to="Meeting Organizer",
                priority="medium",
                extracted_by_model="apertus",
                confidence_score=0.6,
                metadata={"language": language, "extraction_method": "fallback"}
            )]
    
    async def extract_client_requests(self, text: str, language: str = "auto") -> List[ClientRequestCreate]:
        """Extract client requests using Apertus model"""
        prompt = f"""
        Analyze the following meeting transcript and extract all client requests, questions, or service inquiries.
        For each request, provide:
        1. Type of request (service_inquiry, complaint, information_request, etc.)
        2. Description of the request
        3. Urgency level (high/medium/low)
        4. The exact text where this was mentioned
        
        Return the results in JSON format.
        
        Transcript:
        {text}
        """
        
        response = self.client.chat.completions.create(
            model="swiss-ai/Apertus-70B",
            messages=[
                {"role": "system", "content": "You are an expert at analyzing client conversations and identifying requests and service inquiries. Always respond in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
        )
        
        try:
            response_text = response.choices[0].message.content
            requests_data = json.loads(response_text)
            
            requests = []
            for req_data in requests_data.get('requests', []):
                request = ClientRequestCreate(
                    client_id="client_placeholder",  # Will be set by the API endpoint
                    request_type=req_data.get('type', 'information_request'),
                    description=req_data.get('description', ''),
                    urgency=req_data.get('urgency', 'medium'),
                    extracted_text=req_data.get('original_text', ''),
                    confidence_score=0.85,
                    extracted_by_model="apertus",
                    metadata={
                        "language": language,
                        "extraction_method": "apertus_direct"
                    }
                )
                requests.append(request)
            
            return requests
            
        except json.JSONDecodeError:
            return []
    
    async def extract_sentiment(self, text: str, language: str = "auto") -> float:
        """Extract sentiment score using Apertus model"""
        prompt = f"""
        Analyze the sentiment of this meeting transcript. 
        Return a sentiment score between -1.0 (very negative) and 1.0 (very positive).
        Only return the numerical score.
        
        Text: {text}
        """
        
        response = self.client.chat.completions.create(
            model="swiss-ai/Apertus-70B",
            messages=[
                {"role": "system", "content": "You are a sentiment analysis expert. Return only a numerical score between -1.0 and 1.0."},
                {"role": "user", "content": prompt}
            ],
        )
        
        try:
            score_text = response.choices[0].message.content.strip()
            return float(score_text)
        except (ValueError, AttributeError):
            return 0.0  # Neutral if parsing fails
    
    def _parse_due_date(self, due_date_str: str) -> Optional[datetime]:
        """Parse due date string to datetime object"""
        if not due_date_str:
            return None
        
        # Simple parsing - in real implementation, use dateutil or similar
        try:
            return datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
        except:
            return None


class AzureOpenAIExtractor(BaseExtractor):
    """Extractor using Azure OpenAI models"""
    
    def __init__(self):
        # Initialize Azure OpenAI client
        pass  # Implementation depends on Azure OpenAI setup
    
    async def extract_tasks(self, text: str, language: str = "auto") -> List[TaskCreate]:
        # Placeholder implementation
        return [TaskCreate(
            title="Azure OpenAI extracted task",
            description=f"Task from Azure model: {text[:100]}...",
            assigned_to="Advisor",
            priority="medium",
            extracted_by_model="azure_openai",
            confidence_score=0.80,
            metadata={"language": language}
        )]
    
    async def extract_client_requests(self, text: str, language: str = "auto") -> List[ClientRequestCreate]:
        # Placeholder implementation
        return []
    
    async def extract_sentiment(self, text: str, language: str = "auto") -> float:
        # Placeholder implementation
        return 0.0


class OnDeviceExtractor(BaseExtractor):
    """Extractor using on-device models for security"""
    
    def __init__(self):
        # Initialize local model
        pass
    
    async def extract_tasks(self, text: str, language: str = "auto") -> List[TaskCreate]:
        # Placeholder implementation using a local model
        return [TaskCreate(
            title="On-device extracted task",
            description=f"Secure local extraction: {text[:100]}...",
            assigned_to="Advisor",
            priority="medium",
            extracted_by_model="on_device",
            confidence_score=0.75,
            metadata={"language": language, "secure": True}
        )]
    
    async def extract_client_requests(self, text: str, language: str = "auto") -> List[ClientRequestCreate]:
        # Placeholder implementation
        return []
    
    async def extract_sentiment(self, text: str, language: str = "auto") -> float:
        # Placeholder implementation
        return 0.0