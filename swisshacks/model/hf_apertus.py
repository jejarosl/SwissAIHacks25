import os
import requests
import json
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the Hugging Face token and endpoint URL from environment variables
hf_token = os.getenv("HUGGINGFACE_TOKEN")
endpoint_url = os.getenv("HUGGINGFACE_ENDPOINT_URL")

if not hf_token:
    print("Error: HUGGINGFACE_TOKEN not found in environment variables")
    print("Please add your Hugging Face token to the .env file as HUGGINGFACE_TOKEN=your_token_here")
    exit(1)

if not endpoint_url:
    print("Error: HUGGINGFACE_ENDPOINT_URL not found in environment variables")
    print("Please add your endpoint URL to the .env file as HUGGINGFACE_ENDPOINT_URL=your_endpoint_url_here")
    exit(1)

# Prepare the prompt
prompt = "Give me a brief explanation of gravity in simple terms."

def try_inference_client():
    """Try using the InferenceClient from huggingface_hub"""
    try:
        client = InferenceClient(
            model=endpoint_url,
            token=hf_token,
        )
        
        # Try chat completion first
        messages = [{"role": "user", "content": prompt}]
        response = client.chat_completion(
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Chat completion failed: {e}")
        try:
            # Fallback to text generation
            response = client.text_generation(
                prompt=prompt,
                max_new_tokens=1000,
                temperature=0.7,
            )
            return response
        except Exception as e2:
            print(f"Text generation also failed: {e2}")
            return None

def try_direct_api():
    """Try using direct API calls (similar to cURL)"""
    try:
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json"
        }
        
        # For chat models, try this format
        data = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 1000,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        response = requests.post(endpoint_url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            return result
        else:
            print(f"API request failed with status {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"Direct API call failed: {e}")
        return None

# Try different approaches
print(f"Using endpoint: {endpoint_url}")
print(f"Prompt: {prompt}")
print("\n" + "="*50)

# Method 1: InferenceClient
print("Method 1: Using InferenceClient...")
result = try_inference_client()
if result:
    print("Success with InferenceClient!")
    print(f"Response: {result}")
else:
    # Method 2: Direct API call
    print("\nMethod 2: Using direct API call...")
    result = try_direct_api()
    if result:
        print("Success with direct API!")
        print(f"Response: {json.dumps(result, indent=2)}")
    else:
        print("All methods failed. Please check your endpoint URL and token.")
