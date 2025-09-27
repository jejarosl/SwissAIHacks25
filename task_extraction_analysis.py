#!/usr/bin/env python3
"""
SwissAIHacks25 - Task Extraction Analysis Script

End-to-end analysis of GPT-4o and Apertus models for extracting actionable tasks 
from bank client conversation transcripts.

This script:
1. Loads the UBS synthetic call transcripts dataset
2. Identifies useful training context examples
3. Implements both GPT-4o and Apertus predictors
4. Evaluates performance on test data
5. Generates comprehensive analysis and visualizations

Usage:
    python task_extraction_analysis.py

Requirements:
    - Set environment variables: AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_ENDPOINT
    - Optional: HUGGINGFACE_TOKEN, HUGGINGFACE_ENDPOINT_URL for Apertus model
"""

import os
import json
import random
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
from abc import ABC, abstractmethod

import matplotlib.pyplot as plt
from openai import AzureOpenAI
from huggingface_hub import InferenceClient

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not available, use system environment variables

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PromptGenerator:
    """Shared prompt generation for consistent formatting across all models"""
    
    def __init__(self, training_context: str = ""):
        self.training_context = training_context
    
    def create_system_prompt(self) -> str:
        """Create enhanced system prompt with training examples"""
        base_prompt = """You are an expert AI assistant specialized in analyzing bank client conversations to extract actionable tasks.

ALLOWED TASK TYPES (use these exact labels):
- plan_contact: Planning future contact or communication (no specific time is set, might only be a date)
- schedule_meeting: Scheduling meetings or appointments  
- update_contact_info_non_postal: Updating email, phone, or other non-address contact info
- update_contact_info_postal_address: Updating postal/mailing address
- update_kyc_activity: Updating Know Your Customer activity information
- update_kyc_origin_of_assets: Updating information about origin of assets
- update_kyc_purpose_of_businessrelation: Updating purpose of business relationship
- update_kyc_total_assets: Updating total assets information

INSTRUCTIONS:
1. Read the conversation transcript carefully
2. Identify actionable tasks that the client advisor needs to complete
3. Map each task to one of the allowed task types above
4. Return ONLY a JSON array of the relevant task type strings
5. If no tasks are identified, return an empty array: []
6. Do not include any explanation, just the JSON array"""

        if self.training_context:
            return f"{base_prompt}\n\nTraining Examples:\n{self.training_context}"
        return base_prompt
    
    def create_user_prompt(self, conversation: str) -> str:
        """Create user prompt for conversation analysis"""
        return f"\nAnalyze this bank client conversation transcript and extract all actionable tasks:\n\n{conversation}"
    
    def create_single_prompt(self, conversation: str) -> str:
        """Create single prompt for models that don't support system/user separation"""
        system_prompt = self.create_system_prompt()
        user_prompt = self.create_user_prompt(conversation)
        return f"{system_prompt}\n\n{user_prompt}\n\nTasks (JSON array):"



class TaskPredictor(ABC):
    """Abstract base class for task prediction models"""
    
    @abstractmethod
    def predict(self, conversation: str) -> List[str]:
        """Predict tasks from a conversation transcript"""
        pass

class GPT4oTaskPredictor(TaskPredictor):
    """GPT-4o model for predicting tasks from conversation transcripts"""
    
    def __init__(self, training_examples_context: str = ""):
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.endpoint = os.getenv("AZURE_OPENAI_API_ENDPOINT")
        
        if not self.api_key:
            raise ValueError("AZURE_OPENAI_API_KEY not found in environment variables")
        if not self.endpoint:
            raise ValueError("AZURE_OPENAI_API_ENDPOINT not found in environment variables")
            
        self.client = AzureOpenAI(
            api_key=self.api_key,
            api_version="2025-01-01-preview",
            azure_endpoint=self.endpoint,
        )
        
        self.prompt_generator = PromptGenerator(training_examples_context)
    
    def predict(self, conversation: str) -> List[str]:
        """Predict tasks from conversation using GPT-4o"""
        try:
            system_prompt = self.prompt_generator.create_system_prompt()
            user_prompt = self.prompt_generator.create_user_prompt(conversation)
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            result = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                if result.startswith('```json'):
                    result = result.replace('```json', '').replace('```', '').strip()
                
                tasks = json.loads(result)
                return tasks if isinstance(tasks, list) else []
                
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse GPT-4o JSON response: {result}")
                return []
                
        except Exception as e:
            logger.error(f"GPT-4o prediction error: {e}")
            return []

class ApertusTaskPredictor(TaskPredictor):
    """Apertus (Hugging Face) model for predicting tasks"""
    
    def __init__(self, training_examples_context: str = ""):
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        self.hf_endpoint = os.getenv("HUGGINGFACE_ENDPOINT_URL")
        
        if not self.hf_token or not self.hf_endpoint:
            logger.warning("Hugging Face credentials not found. Apertus predictor will return empty results.")
            self.client = None
        else:
            self.client = InferenceClient(
                model=self.hf_endpoint,
                token=self.hf_token,
                timeout=120
            )
        
        self.prompt_generator = PromptGenerator(training_examples_context)
    
    def predict(self, conversation: str) -> List[str]:
        """Predict tasks using Apertus model"""
        if not self.session:
            return []
            
        try:
            prompt = self.prompt_generator.create_single_prompt(conversation)
            
            # Try chat completion first
            try:
                response = self.client.chat_completion(
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=200,
                    temperature=0.1
                )
                result = response.choices[0].message.content.strip()
            except Exception:
                # Fallback to text generation
                response = self.client.text_generation(
                    prompt,
                    max_new_tokens=200,
                    temperature=0.1
                )
                result = response.strip()
            
            # Parse JSON response
            try:
                if result.startswith('```json'):
                    result = result.replace('```json', '').replace('```', '').strip()
                
                # Extract JSON array from response
                start = result.find('[')
                end = result.rfind(']') + 1
                if start >= 0 and end > start:
                    json_str = result[start:end]
                    tasks = json.loads(json_str)
                    return tasks if isinstance(tasks, list) else []
                
                return []
                
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse Apertus JSON response: {result}")
                return []
                
        except Exception as e:
            logger.error(f"Apertus prediction error: {e}")
            return []

class SwisscomApertusTaskPredictor(TaskPredictor):
    """Swisscom Apertus API model for predicting tasks"""
    
    def __init__(self, training_examples_context: str = ""):
        self.api_key = os.getenv("SWISSCOM_API_KEY")
        
        if not self.api_key:
            logger.warning("SWISSCOM_API_KEY not found. Swisscom Apertus predictor will return empty results.")
            self.session = None
        else:
            import requests
            self.session = requests.Session()
            self.session.headers.update({
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            })
            self.endpoint = 'https://api.swisscom.ch/llm/inference/v1/chat/completions'
        
        self.prompt_generator = PromptGenerator(training_examples_context)
    
    def predict(self, conversation: str) -> List[str]:
        """Predict tasks using Swisscom Apertus API"""
        if not self.session:
            return []
            
        try:
            # Use the same prompt format as other models
            system_prompt = self.prompt_generator.create_system_prompt()
            user_prompt = self.prompt_generator.create_user_prompt(conversation)
            
            payload = {
                "model": "apertus-1.0",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.1,
                "max_tokens": 500
            }
            
            response = self.session.post(self.endpoint, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content'].strip()
            
            # Parse JSON response (same logic as other predictors)
            try:
                if content.startswith('```json'):
                    content = content.replace('```json', '').replace('```', '').strip()
                
                # Extract JSON array from response
                start = content.find('[')
                end = content.rfind(']') + 1
                if start >= 0 and end > start:
                    json_str = content[start:end]
                    tasks = json.loads(json_str)
                    return tasks if isinstance(tasks, list) else []
                
                # Try direct JSON parse
                tasks = json.loads(content)
                return tasks if isinstance(tasks, list) else []
                
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse Swisscom Apertus JSON response: {content}")
                return []
                
        except Exception as e:
            logger.error(f"Swisscom Apertus prediction error: {e}")
            return []

class DatasetLoader:
    """Handles loading and preprocessing of the UBS dataset"""
    
    def __init__(self, data_dir: str = "data/ubs_synthetic_call_transcripts_dataset"):
        self.data_dir = Path(data_dir)
        self.train_dir = self.data_dir / "train"
        self.test_dir = self.data_dir / "test"
        self.validation_dir = self.data_dir / "validation"
    
    def load_dataset_split(self, split_dir: Path) -> Dict[str, Any]:
        """Load all JSON and TXT files from a dataset split directory"""
        json_files = list(split_dir.glob("*.json"))
        txt_files = list(split_dir.glob("*.txt"))
        
        data = {
            "conversations": [],
            "tasks": []
        }
        
        # Load JSON files (ground truth tasks)
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    tasks_data = json.load(f)
                    data["tasks"].append({
                        "file_id": json_file.stem,
                        "tasks": tasks_data
                    })
            except Exception as e:
                logger.error(f"Error loading {json_file}: {e}")
        
        # Load TXT files (conversation transcripts)
        for txt_file in txt_files:
            try:
                with open(txt_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    data["conversations"].append({
                        "file_id": txt_file.stem,
                        "content": content
                    })
            except Exception as e:
                logger.error(f"Error loading {txt_file}: {e}")
        
        return data
    
    def load_all_splits(self) -> Tuple[Dict, Dict, Dict]:
        """Load all dataset splits"""
        logger.info("Loading dataset splits...")
        
        train_data = self.load_dataset_split(self.train_dir)
        test_data = self.load_dataset_split(self.test_dir)
        validation_data = self.load_dataset_split(self.validation_dir)
        
        logger.info(f"Loaded - Train: {len(train_data['conversations'])} conversations, "
                   f"Test: {len(test_data['conversations'])} conversations, "
                   f"Validation: {len(validation_data['conversations'])} conversations")
        
        return train_data, test_data, validation_data

class ContextExtractor:
    """Extracts useful training context examples for few-shot learning"""
    
    def __init__(self, allowed_task_labels: List[str]):
        self.allowed_task_labels = allowed_task_labels
    
    def create_matched_pairs(self, data: Dict) -> List[Dict]:
        """Create matched conversation-task pairs"""
        conversation_dict = {conv['file_id']: conv['content'] for conv in data['conversations']}
        tasks_dict = {task['file_id']: task['tasks'] for task in data['tasks']}
        
        matched_pairs = []
        for file_id in conversation_dict:
            if file_id in tasks_dict:
                matched_pairs.append({
                    'file_id': file_id,
                    'conversation': conversation_dict[file_id],
                    'tasks': tasks_dict[file_id]
                })
        
        return matched_pairs
    
    def select_representative_examples(self, train_data: Dict, num_examples: int = 10, 
                                    random_seed: int = 42) -> List[Dict]:
        """Select representative examples covering different task types"""
        random.seed(random_seed)
        
        matched_pairs = self.create_matched_pairs(train_data)
        
        # Analyze task distribution
        task_distribution = defaultdict(list)
        no_task_examples = []
        multi_task_examples = []
        
        for pair in matched_pairs:
            if not pair['tasks']:
                no_task_examples.append(pair)
            else:
                if len(pair['tasks']) > 1:
                    multi_task_examples.append(pair)
                
                for task_dict in pair['tasks']:
                    task_type = task_dict.get('task_type', 'unknown')
                    task_distribution[task_type].append(pair)
        
        logger.info("Task distribution in training data:")
        for task_type in self.allowed_task_labels:
            count = len(task_distribution.get(task_type, []))
            logger.info(f"  {task_type}: {count} examples")
        
        # Select representative examples
        representative_examples = []
        selected_file_ids = set()
        
        # One example per task type
        for task_type in self.allowed_task_labels:
            if task_type in task_distribution and task_distribution[task_type]:
                available_examples = [ex for ex in task_distribution[task_type] 
                                    if ex['file_id'] not in selected_file_ids]
                if available_examples:
                    selected = random.choice(available_examples)
                    
                    # Extract task types only
                    task_types = [t.get('task_type', 'unknown') for t in selected['tasks']]
                    
                    representative_examples.append({
                        'file_id': selected['file_id'],
                        'conversation': self._clean_conversation(selected['conversation']),
                        'tasks': task_types,
                        'selection_reason': f'Representative of: {task_type}'
                    })
                    selected_file_ids.add(selected['file_id'])
        
        # Add no-task example
        if no_task_examples and len(representative_examples) < num_examples:
            available_no_task = [ex for ex in no_task_examples 
                               if ex['file_id'] not in selected_file_ids]
            if available_no_task:
                selected = random.choice(available_no_task)
                representative_examples.append({
                    'file_id': selected['file_id'],
                    'conversation': self._clean_conversation(selected['conversation']),
                    'tasks': [],
                    'selection_reason': 'No tasks example'
                })
                selected_file_ids.add(selected['file_id'])
        
        # Fill remaining with multi-task examples
        while len(representative_examples) < num_examples and multi_task_examples:
            available_multi = [ex for ex in multi_task_examples 
                             if ex['file_id'] not in selected_file_ids]
            if not available_multi:
                break
            
            selected = random.choice(available_multi)
            task_types = [t.get('task_type', 'unknown') for t in selected['tasks']]
            
            representative_examples.append({
                'file_id': selected['file_id'],
                'conversation': self._clean_conversation(selected['conversation']),
                'tasks': task_types,
                'selection_reason': f'Multi-task: {", ".join(task_types)}'
            })
            selected_file_ids.add(selected['file_id'])
            multi_task_examples.remove(selected)
        
        logger.info(f"Selected {len(representative_examples)} representative examples")
        return representative_examples
    
    def _clean_conversation(self, conversation: str) -> str:
        """Remove disclaimer and clean conversation content"""
        if "DISCLAIMER:" in conversation:
            lines = conversation.split('\n')
            clean_lines = []
            skip_disclaimer = True
            for line in lines:
                if skip_disclaimer and ("Speaker" in line or "Advisor" in line or "Client" in line):
                    skip_disclaimer = False
                if not skip_disclaimer:
                    clean_lines.append(line)
            return '\n'.join(clean_lines).strip()
        return conversation.strip()
    
    def create_training_context_string(self, examples: List[Dict], 
                                     compact: bool = False) -> str:
        """Create formatted training context string for model prompts"""
        prompt_parts = []
        
        if not compact:
            prompt_parts.append("TRAINING EXAMPLES FOR TASK EXTRACTION:")
            prompt_parts.append("=" * 50)
            prompt_parts.append("")
            prompt_parts.append("Below are representative examples showing conversations and expected task extractions:")
            prompt_parts.append("")
        
        for i, example in enumerate(examples, 1):
            if compact:
                prompt_parts.append(f"Example {i}: {example['selection_reason']}")
                conversation = example['conversation']
                if len(conversation) > 500:
                    conversation = conversation[:500] + "..."
                prompt_parts.append(f"Conversation: {conversation}")
                prompt_parts.append(f"Tasks: {example['tasks']}")
                prompt_parts.append("")
            else:
                prompt_parts.append(f"EXAMPLE {i}:")
                prompt_parts.append(f"Purpose: {example['selection_reason']}")
                prompt_parts.append("")
                
                conversation = example['conversation']
                if len(conversation) > 1500:
                    conversation = conversation[:1500] + "\n... [CONVERSATION CONTINUES]"
                
                prompt_parts.append("CONVERSATION:")
                prompt_parts.append(conversation)
                prompt_parts.append("")
                
                if example['tasks']:
                    prompt_parts.append(f"EXPECTED TASKS: {example['tasks']}")
                else:
                    prompt_parts.append("EXPECTED TASKS: [] (no tasks)")
                
                prompt_parts.append("")
                prompt_parts.append("-" * 30)
                prompt_parts.append("")
        
        return "\n".join(prompt_parts)

class ModelEvaluator:
    """Evaluates model performance using the provided scoring function"""
    
    def __init__(self, allowed_task_labels: List[str]):
        self.allowed_labels = allowed_task_labels
    
    def evaluate_predictions(self, y_true: List[List[str]], y_pred: List[List[str]]) -> float:
        """Evaluation function from the original challenge"""
        if len(y_true) != len(y_pred):
            raise ValueError("Length mismatch between y_true and y_pred")
        
        total_score = 0.0
        
        for true_labels, pred_labels in zip(y_true, y_pred):
            # Validate labels
            for label in true_labels + pred_labels:
                if label not in self.allowed_labels:
                    raise ValueError(f"Invalid label: {label}")
            
            true_set = set(true_labels)
            pred_set = set(pred_labels)
            
            # Calculate components
            tp = len(true_set & pred_set)  # True positives
            fp = len(pred_set - true_set)  # False positives  
            fn = len(true_set - pred_set)  # False negatives
            
            # Weighted scoring: FN penalty = 2.0, FP penalty = 1.0
            sample_score = tp / (tp + 2.0 * fn + 1.0 * fp) if (tp + fn + fp) > 0 else 1.0
            total_score += sample_score
        
        return total_score / len(y_true)
    
    def remove_duplicates(self, predictions: List[List[str]]) -> Tuple[List[List[str]], int]:
        """Remove duplicate predictions and return count of removed duplicates"""
        cleaned_predictions = []
        total_duplicates = 0
        
        for pred_list in predictions:
            seen = set()
            cleaned = []
            for pred in pred_list:
                if pred not in seen:
                    cleaned.append(pred)
                    seen.add(pred)
                else:
                    total_duplicates += 1
            cleaned_predictions.append(cleaned)
        
        return cleaned_predictions, total_duplicates

class AnalysisVisualizer:
    """Creates visualizations for the analysis results"""
    
    def __init__(self, allowed_task_labels: List[str]):
        self.allowed_task_labels = allowed_task_labels
    
    def create_performance_dashboard(self, results: Dict, output_path: str = None):
        """Create comprehensive performance visualization dashboard"""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
        
        # 1. Model Performance Comparison
        models = list(results['scores'].keys())
        scores = list(results['scores'].values())
        
        # Dynamic colors based on number of models
        model_colors = ['#ff6b35', '#004e89', '#00b894', '#6c5ce7', '#fd79a8'][:len(models)]
        bars = ax1.bar(models, scores, alpha=0.8, color=model_colors)
        ax1.set_ylabel('Performance Score')
        ax1.set_title('Model Performance Comparison', fontweight='bold', fontsize=14)
        ax1.set_ylim(0, 1)
        
        # Add score labels on bars
        for bar, score in zip(bars, scores):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{score:.3f}', ha='center', va='bottom', fontweight='bold')
        
        # 2. Task Type Distribution in Ground Truth
        if results['ground_truth_tasks']:
            gt_counts = Counter(results['ground_truth_tasks'])
            task_names = [name.replace('_', ' ').replace('update ', '').title() 
                         for name in gt_counts.keys()]
            ax2.barh(task_names, list(gt_counts.values()), alpha=0.7, color='#2d3436')
            ax2.set_xlabel('Frequency')
            ax2.set_title('Task Type Distribution in Ground Truth')
            ax2.tick_params(axis='y', labelsize=9)
        
        # 3. Prediction Volume Comparison
        pred_counts = {}
        for model in models:
            pred_counts[model] = sum(len(pred) for pred in results['predictions'][model])
        pred_counts['Ground Truth'] = sum(len(gt) for gt in results['ground_truth'])
        
        # Dynamic colors for prediction volume chart
        volume_colors = ['#ff6b35', '#004e89', '#00b894', '#6c5ce7', '#fd79a8'][:len(pred_counts)]
        ax3.bar(pred_counts.keys(), pred_counts.values(), 
                color=volume_colors, alpha=0.8)
        ax3.set_ylabel('Total Predictions')
        ax3.set_title('Total Number of Task Predictions')
        ax3.tick_params(axis='x', rotation=45)
        
        # Add count labels
        for i, (model, count) in enumerate(pred_counts.items()):
            ax3.text(i, count + 1, str(count), ha='center', va='bottom', fontweight='bold')
        
        # 4. Performance Metrics Table
        ax4.axis('tight')
        ax4.axis('off')
        
        table_data = []
        for model in models:
            duplicates = results.get('duplicates_removed', {}).get(model, 0)
            table_data.append([
                model,
                f"{results['scores'][model]:.3f}",
                str(pred_counts[model]),
                str(duplicates)
            ])
        
        table = ax4.table(cellText=table_data,
                         colLabels=['Model', 'Score', 'Total Preds', 'Duplicates Removed'],
                         cellLoc='center',
                         loc='center',
                         colWidths=[0.2, 0.15, 0.2, 0.25])
        
        table.auto_set_font_size(False)
        table.set_fontsize(11)
        table.scale(1.2, 1.5)
        
        # Style the table
        for i in range(len(table_data) + 1):
            for j in range(4):
                cell = table[(i, j)]
                if i == 0:  # Header row
                    cell.set_facecolor('#2d3436')
                    cell.set_text_props(weight='bold', color='white')
                else:
                    cell.set_facecolor('#f8f9fa' if i % 2 == 0 else 'white')
        
        ax4.set_title('Detailed Performance Metrics', fontweight='bold', fontsize=14, pad=20)
        
        plt.suptitle('SwissAIHacks25 - Task Extraction Analysis', 
                     fontsize=16, fontweight='bold', y=0.98)
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            logger.info(f"Dashboard saved to {output_path}")
        
        plt.show()

class TaskExtractionAnalysis:
    """Main analysis orchestrator"""
    
    def __init__(self, data_dir: str = "data/ubs_synthetic_call_transcripts_dataset"):
        self.allowed_task_labels = [
            'plan_contact',
            'schedule_meeting', 
            'update_contact_info_non_postal',
            'update_contact_info_postal_address',
            'update_kyc_activity',
            'update_kyc_origin_of_assets',
            'update_kyc_purpose_of_businessrelation',
            'update_kyc_total_assets'
        ]
        
        self.loader = DatasetLoader(data_dir)
        self.context_extractor = ContextExtractor(self.allowed_task_labels)
        self.evaluator = ModelEvaluator(self.allowed_task_labels)
        self.visualizer = AnalysisVisualizer(self.allowed_task_labels)
    
    def run_complete_analysis(self, use_training_context: bool = True, 
                            test_subset_size: Optional[int] = None,
                            output_dir: str = "results") -> Dict:
        """Run the complete end-to-end analysis"""
        logger.info("🚀 Starting SwissAIHacks25 Task Extraction Analysis")
        
        # Create output directory
        Path(output_dir).mkdir(exist_ok=True)
        
        # 1. Load data
        train_data, test_data, validation_data = self.loader.load_all_splits()
        
        # 2. Extract training context if requested
        training_context = ""
        if use_training_context:
            logger.info("Extracting representative training examples...")
            examples = self.context_extractor.select_representative_examples(train_data)
            training_context = self.context_extractor.create_training_context_string(
                examples, compact=True
            )
            logger.info(f"Created training context: {len(training_context)} characters")
            logger.info("Training context: {training_context}")
        
        # 3. Prepare test data
        test_pairs = self.context_extractor.create_matched_pairs(test_data)
        
        if test_subset_size:
            test_pairs = test_pairs[:test_subset_size]
            logger.info(f"Using test subset of {len(test_pairs)} conversations")
        
        test_conversations = [pair['conversation'] for pair in test_pairs]
        
        # Extract ground truth tasks
        y_true = []
        for pair in test_pairs:
            task_types = []
            if pair['tasks']:
                for task_dict in pair['tasks']:
                    task_type = task_dict.get('task_type', 'unknown')
                    if task_type in self.allowed_task_labels:
                        task_types.append(task_type)
            y_true.append(task_types)
        
        logger.info(f"Prepared {len(test_conversations)} test conversations")
        
        # 4. Initialize predictors
        logger.info("Initializing predictors...")
        try:
            gpt4o_predictor = GPT4oTaskPredictor(training_context)
            gpt4o_available = True
        except Exception as e:
            logger.error(f"GPT-4o initialization failed: {e}")
            gpt4o_available = False
        
        try:
            apertus_predictor = ApertusTaskPredictor(training_context)
            apertus_available = True
        except Exception as e:
            logger.warning(f"Apertus HF initialization failed: {e}")
            apertus_available = False
        
        try:
            swisscom_apertus_predictor = SwisscomApertusTaskPredictor(training_context)
            swisscom_apertus_available = True
        except Exception as e:
            logger.warning(f"Swisscom Apertus initialization failed: {e}")
            swisscom_apertus_available = False
        
        # 5. Run predictions
        results = {
            'scores': {},
            'predictions': {},
            'ground_truth': y_true,
            'ground_truth_tasks': [task for tasks in y_true for task in tasks],
            'duplicates_removed': {}
        }
        
        if gpt4o_available:
            logger.info("Running GPT-4o predictions...")
            gpt4o_predictions = []
            for i, conversation in enumerate(test_conversations):
                if i % 50 == 0:
                    logger.info(f"GPT-4o progress: {i}/{len(test_conversations)}")
                
                pred = gpt4o_predictor.predict(conversation)
                gpt4o_predictions.append(pred)
            
            # Clean and evaluate
            gpt4o_clean, gpt4o_dups = self.evaluator.remove_duplicates(gpt4o_predictions)
            gpt4o_score = self.evaluator.evaluate_predictions(y_true, gpt4o_clean)
            
            results['scores']['GPT-4o'] = gpt4o_score
            results['predictions']['GPT-4o'] = gpt4o_clean
            results['duplicates_removed']['GPT-4o'] = gpt4o_dups
            
            logger.info(f"GPT-4o Score: {gpt4o_score:.3f}")
        
        if apertus_available:
            logger.info("Running Apertus predictions...")
            apertus_predictions = []
            for i, conversation in enumerate(test_conversations):
                if i % 50 == 0:
                    logger.info(f"Apertus progress: {i}/{len(test_conversations)}")
                
                pred = apertus_predictor.predict(conversation)
                apertus_predictions.append(pred)
            
            # Clean and evaluate
            apertus_clean, apertus_dups = self.evaluator.remove_duplicates(apertus_predictions)
            apertus_score = self.evaluator.evaluate_predictions(y_true, apertus_clean)
            
            results['scores']['Apertus'] = apertus_score
            results['predictions']['Apertus'] = apertus_clean
            results['duplicates_removed']['Apertus'] = apertus_dups
            
            logger.info(f"Apertus Score: {apertus_score:.3f}")
        
        if swisscom_apertus_available:
            logger.info("Running Swisscom Apertus predictions...")
            swisscom_predictions = []
            for i, conversation in enumerate(test_conversations):
                if i % 50 == 0:
                    logger.info(f"Swisscom Apertus progress: {i}/{len(test_conversations)}")
                
                pred = swisscom_apertus_predictor.predict(conversation)
                swisscom_predictions.append(pred)
            
            # Clean and evaluate
            swisscom_clean, swisscom_dups = self.evaluator.remove_duplicates(swisscom_predictions)
            swisscom_score = self.evaluator.evaluate_predictions(y_true, swisscom_clean)
            
            results['scores']['Swisscom-Apertus'] = swisscom_score
            results['predictions']['Swisscom-Apertus'] = swisscom_clean
            results['duplicates_removed']['Swisscom-Apertus'] = swisscom_dups
            
            logger.info(f"Swisscom Apertus Score: {swisscom_score:.3f}")
        
        # 6. Generate analysis report
        self._generate_report(results, output_dir)
        
        # 7. Create visualizations
        logger.info("Creating performance dashboard...")
        dashboard_path = Path(output_dir) / "performance_dashboard.png"
        self.visualizer.create_performance_dashboard(results, dashboard_path)
        
        # 8. Save results
        results_path = Path(output_dir) / "analysis_results.json"
        with open(results_path, 'w') as f:
            # Convert numpy arrays to lists for JSON serialization
            serializable_results = {
                'scores': results['scores'],
                'ground_truth_count': len(results['ground_truth']),
                'ground_truth_tasks_count': len(results['ground_truth_tasks']),
                'duplicates_removed': results['duplicates_removed'],
                'test_conversations_count': len(test_conversations)
            }
            json.dump(serializable_results, f, indent=2)
        
        logger.info(f"✅ Analysis complete! Results saved to {output_dir}")
        return results
    
    def _generate_report(self, results: Dict, output_dir: str):
        """Generate detailed analysis report"""
        report_lines = []
        report_lines.append("SwissAIHacks25 - Task Extraction Analysis Report")
        report_lines.append("=" * 60)
        report_lines.append("")
        
        # Performance Summary
        report_lines.append("🏆 PERFORMANCE SUMMARY")
        report_lines.append("-" * 30)
        
        if results['scores']:
            best_model = max(results['scores'].keys(), key=lambda k: results['scores'][k])
            best_score = results['scores'][best_model]
            
            for model, score in results['scores'].items():
                status = "🥇" if model == best_model else "  "
                report_lines.append(f"{status} {model}: {score:.3f}")
            
            if len(results['scores']) > 1:
                improvement = best_score - min(results['scores'].values())
                report_lines.append(f"\n📈 Best model advantage: {improvement:.3f} points")
        
        report_lines.append("")
        
        # Dataset Statistics
        report_lines.append("📊 DATASET STATISTICS")
        report_lines.append("-" * 30)
        report_lines.append(f"Test conversations: {len(results['ground_truth'])}")
        report_lines.append(f"Total ground truth tasks: {len(results['ground_truth_tasks'])}")
        
        if results['ground_truth']:
            avg_tasks = len(results['ground_truth_tasks']) / len(results['ground_truth'])
            report_lines.append(f"Average tasks per conversation: {avg_tasks:.1f}")
        
        # Task Distribution
        if results['ground_truth_tasks']:
            task_counts = Counter(results['ground_truth_tasks'])
            report_lines.append("\nTask type distribution:")
            for task_type in sorted(task_counts.keys()):
                report_lines.append(f"  {task_type}: {task_counts[task_type]}")
        
        report_lines.append("")
        
        # Model Details
        for model in results['scores'].keys():
            report_lines.append(f"🤖 {model.upper()} DETAILS")
            report_lines.append("-" * 30)
            report_lines.append(f"Score: {results['scores'][model]:.3f}")
            
            total_preds = sum(len(pred) for pred in results['predictions'][model])
            report_lines.append(f"Total predictions: {total_preds}")
            
            if model in results['duplicates_removed']:
                report_lines.append(f"Duplicates removed: {results['duplicates_removed'][model]}")
            
            report_lines.append("")
        
        # Save report
        report_path = Path(output_dir) / "analysis_report.txt"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        # Also print to console
        for line in report_lines:
            print(line)

def main():
    """Main execution function"""
    logger.info("🚀 SwissAIHacks25 Task Extraction Analysis")
    
    # Check for required environment variables
    required_vars = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_API_ENDPOINT']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        logger.error("Please set these variables before running the analysis.")
        return
    
    # Initialize and run analysis
    analysis = TaskExtractionAnalysis()
    
    results = analysis.run_complete_analysis(
        use_training_context=False,
        test_subset_size=None,  # Use full test set, or set to e.g. 100 for testing
        output_dir="analysis_results"
    )
    
    logger.info("✅ Analysis completed successfully!")
    
    if results['scores']:
        best_model = max(results['scores'].keys(), key=lambda k: results['scores'][k])
        logger.info(f"🏆 Best performing model: {best_model} ({results['scores'][best_model]:.3f})")

if __name__ == "__main__":
    main()