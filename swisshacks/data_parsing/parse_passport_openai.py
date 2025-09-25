import base64
import json
from pathlib import Path
import os
from openai import AzureOpenAI

from client_data.client_passport import ClientPassport, GenderEnum

# Get API key from environment variable or define it
api_key = os.environ.get("AZURE_OPENAI_API_KEY")
api_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")


class PassportParserOpenAI():
    def __init__(self, *args, **kwargs):
        """
        Initialize the PassportParserOpenAI class.
        """
        super().__init__(*args, **kwargs)
        self.client = AzureOpenAI(
            api_key=api_key,
            api_version="2025-03-01-preview",
            azure_endpoint=api_endpoint,
        )

    def parse(self, path_to_file: Path) -> ClientPassport:
        """
        Parse a passport image file to extract structured data.

        Args:
            path_to_file: Path to the passport image file

        Returns:
            ClientPassport object containing extracted passport information
        """

        ""
        def preprocess_issuing_country(passport: dict) -> dict:
            issuing_country_strings = passport["issuing_country"].lower().split("/")
            issuing_country_strings = [s.strip() for s in issuing_country_strings]

            if len(issuing_country_strings) == 1:
                passport["issuing_country"] = issuing_country_strings[0]
                return passport
            elif len(issuing_country_strings) == 2:
                passport["issuing_country"] = issuing_country_strings[1]
                return passport
            else:
                raise ValueError(f"Issuing country format is not recognized: {passport['issuing_country']!r}")

        if not path_to_file.exists():
            raise FileNotFoundError(f"File '{path_to_file!r}' does not exist")

        # Encode PNG as base64 for the AI to analyze
        with open(path_to_file, "rb") as image_file:
            image_data = image_file.read()
            encoded_data = base64.b64encode(image_data).decode("utf-8")

        passport_data = self.parse_png(encoded_data)

        passport_data["sex"] = GenderEnum.convert_str_to_enum(passport_data.get("sex"))
        preprocess_issuing_country(passport_data)

        # Create a ClientPassport object from the parsed data and return it
        return ClientPassport(**passport_data)


    def parse_png(self, encoded_image: bytes) -> dict:
        """
        Parse a PNG image using OpenAI's vision API to extract structured data.
        """

        # Define expected JSON schema for passport data
        passport_json_schema = """{
        "given_name": "string",
        "surname": "string",
        "sex": "string",
        "birth_date": "YYYY-MM-DD",
        "citizenship": "string",
        "issuing_country": "string",
        "country_code": "string",
        "number": "string",
        "passport_mrz": ["array", "of", "strings"],
        "issue_date": "YYYY-MM-DD",
        "expiry_date": "YYYY-MM-DD"
        "signature": "boolean"

        }"""

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a helpful assistant focused on parsing image data from a passport to a structured JSON format.\
                        Extract all visible information in the exact order as presented in the passport image. Return ONLY valid JSON without any additional text.\
                        Do not change order of any items within the required format fields and be very precise in extracting all human readable characters.\
                            The required JSON format is: {passport_json_schema}",
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all information from this passport image and return it as JSON:",
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{encoded_image}"},
                        },
                    ],
                },
            ],
            temperature=0.1,  # Lower temperature for more deterministic responses
            response_format={"type": "json_object"},  # Ensure response is formatted as JSON
        )

        try:
            passport_data = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            print(f"Raw response: {response.choices[0].message.content}")
            raise

        return passport_data
