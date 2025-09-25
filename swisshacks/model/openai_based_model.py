from openai import AzureOpenAI
import json
from pathlib import Path
from typing import List, Dict, Any
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

    def predict(self,client_data: ClientData) -> bool:
        passport = client_data.passport.to_json()
        account = client_data.account_form.to_json()
        profile = client_data.client_profile.to_json()
        description = client_data.client_description.to_json()

        PROMPT = """
            Here is a set of JSON files containing information about a client. Verify the content for any logical inconsistencies.
            - Compare the logically matching fields across documents
            - Check if the description of the client adds up with the numbers and backstories.
            - You can reason for yourself shortly.
            - last line of your response should be a JSON format with bool field: 'reject': true/false.
            - Most importantly reject only if the document breaks one of these rules:
            - {rules}

            Here is the JSON data: passport {passport}, account {account}, profile {profile}, description {description}
        """
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
                        rules=self.rules,
                        passport=passport,
                        account=account,
                        profile=profile,
                        description=description,
                    ),
                },
            ],
        )

        # Extract the rejection decision
        response_content = response.choices[0].message.content
        print(f"Validation response: {response_content}")

        regex_match = re.search(r"```json\n*\{\n*\s*[\"\']reject[\"\']:\s*(?P<reject_result>\w+)\s*\n*\}\n*```", response_content)
        if regex_match:
            print(f"Regex match succeeded, extracted decision: {regex_match.group('reject_result')}")
            return bool(regex_match.group("reject_result").lower() == "false")
        else:
            print("Regex match failed, trying to find the decision in the text")
            raise RuntimeError



def check_data_consistency(
    account_json_path: str,
    profile_json_path: str,
    description_json_path: str,
    passport_png_path: str,
    rules_path: str,
) -> Dict[str, Any]:
    """
    Check consistency across multiple data files for a client

    Args:
        account_json_path: Path to account JSON file
        profile_json_path: Path to profile JSON file
        description_json_path: Path to passport JSON file
        passport_png_path: Path to passport PNG image
        rules_path: Path to rules file

    Returns:
        Dict with consistency check results and reasoning
    """
    # Load JSON data
    with open(account_json_path, "r") as f:
        account_data = json.load(f)

    with open(profile_json_path, "r") as f:
        profile_data = json.load(f)

    with open(description_json_path, "r") as f:
        description_data = json.load(f)

    # Encode PNG as base64 for the AI to analyze
    with open(passport_png_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

    # Combine all data into a single structure for analysis
    combined_data = {
        "account": account_data,
        "profile": profile_data,
        "description": description_data,
        "passport_image_base64": encoded_image,
    }

    # Create prompt for consistency check
    consistency_prompt = f"""
    Analyze the provided client data for consistency across different documents.

    Account data: {json.dumps(account_data, indent=2)}

    Profile data: {json.dumps(profile_data, indent=2)}

    Description data: {json.dumps(description_data, indent=2)}

    The passport image is also provided as base64. Please check if the data is consistent across all sources.

    Check for:
    1. Name consistency across all documents. Ordering of given name and surname may vary and it is not considered an inconsistency.
    2. Address consistency
    3. Passport number matching between passport data and account data
    4. Any suspicious inconsistencies or missing critical information
    5. Any signs of fraud or data manipulation
    6. Validate MRZ is of valid format and matches the passport number, holders name nationality and date of birth.
    7. Check if signatures are consistent across documents.

    Provide detailed reasoning about any inconsistencies found.
    Respond with a JSON structure that includes:
    - "is_consistent": true/false
    - "inconsistencies": [list of specific inconsistencies found]
    - "reasoning": detailed explanation of your findings
    - "risk_level": "low", "medium", or "high"
    - "only_small_inconsistencies": true/false (if the inconsistencies are minor and do not affect the decision-making process)
    """

    # Create Azure OpenAI client for this specific check
    consistency_client = AzureOpenAI(
        api_key=os.environ.get(
            "AZURE_OPENAI_API_KEY"
        ),  # Ensure this is set in your environment
        api_version="2025-01-01-preview",
        azure_endpoint=os.environ.get(
            "AZURE_OPENAI_ENDPOINT"
        ),  # Ensure this is set in your environment
    )

    # Make API call
    consistency_response = consistency_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a financial fraud detection assistant that specializes in identifying inconsistencies in client documentation. Only identify inconsistencies that are critical to the decision-making process and missing critical information. Take a note that some of the fields can be separated into multiple keys in json formats (like address). Disregard missing account number and expected_transactional_behavior.",
            },
            {"role": "user", "content": consistency_prompt},
        ],
        temperature=0.1,  # Lower temperature for more deterministic responses
    )

    # Extract and parse the response
    response_content = consistency_response.choices[0].message.content

    # Find and extract JSON from the response
    try:
        # Try to extract JSON from the response content
        import re

        json_match = re.search(r"```json\n(.*?)\n```", response_content, re.DOTALL)
        if json_match:
            result_json = json.loads(json_match.group(1))
        else:
            # Try to parse the entire response as JSON
            result_json = json.loads(response_content)
    except json.JSONDecodeError:
        # If parsing fails, return a structured error
        result_json = {
            "is_consistent": False,
            "inconsistencies": ["Unable to parse AI response into structured format"],
            "reasoning": response_content,
            "risk_level": "medium",
        }

    return result_json


# Example usage
if __name__ == "__main__":
    # Test data consistency function
    print("\n--- Running Data Consistency Check ---")

    # Example paths - update these with your actual file paths
    base_dir = Path(
        "c:/Users/jekatrinaj/swisshacks/data/level_1"
    )  # Using level_1 as example
    account_json = base_dir / "account.json"
    profile_json = base_dir / "profile.json"
    description_json = base_dir / "description.json"
    passport_png = base_dir / "passport.png"

    # Create a simple rules file if it doesn't exist
    rules_path = Path("./validation_rules.txt")
    if not rules_path.exists():
        with open(rules_path, "w") as f:
            f.write("""
            1. Names must be consistent across all documents
            2. Passport number must match between passport and account documents
            3. Address information must be consistent
            4. Critical fields must not be empty
            5. Date formats must be valid
            """)

    try:
        # Run the consistency check
        consistency_result = check_data_consistency(
            str(account_json),
            str(profile_json),
            str(description_json),
            str(passport_png),
            str(rules_path),
        )

        print("\n--- Consistency Check Results ---")
        print(json.dumps(consistency_result, indent=2))

        if not consistency_result.get("is_consistent", False):
            print("\nWARNING: Inconsistencies detected in the client data!")
            for i, inconsistency in enumerate(
                consistency_result.get("inconsistencies", [])
            ):
                print(f"{i + 1}. {inconsistency}")
        else:
            print("\nAll data appears consistent.")

    except Exception as e:
        print(f"Error during consistency check: {str(e)}")
