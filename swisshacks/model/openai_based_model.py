from openai import AzureOpenAI
import json
from pathlib import Path
from typing import Dict, Any
import base64
import os
import re

from model.base_predictor import BasePredictor
from client_data.client_data import ClientData

DEFAULT_RULEBOOK_PATH = Path(__file__).parent / "validation_rules.txt"

class OpenAIPredictor(BasePredictor):
    def __init__(self, rulebook_path: Path = None):
        if rulebook_path is None:
            rulebook_path = DEFAULT_RULEBOOK_PATH

        with open(rulebook_path, "r") as f:
            self.rules = f.read()

    def predict(self, conversation):
        
        client_openai = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version="2025-01-01-preview",
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        )

        response = client_openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful and precise assistant focused on data input cross-validation.",
                },
                {
                    "role": "user",
                    "content": PROMPT.format(
                        rules=conversation,
                    ),
                },
            ],
        )

        # Extract the rejection decision
        response_content = response.choices[0].message.content
        print(f"Validation response: {response_content}")

       ...


