#system imports
import re
import argparse
from io import BytesIO
import io
from pathlib import Path
from typing import Union, BinaryIO, Dict, Any

try:
    from PyPDF2 import PdfReader
except ImportError:
    raise ImportError("PyPDF2 package is required. Install it with: pip install PyPDF2")

# local imports
from client_data.client_account import ClientAccount
from data_parsing.client_parser import ParserClass

class ClientAccountParser(ParserClass):
    """Parser for client account pdf files"""

    @staticmethod
    def extract_text_from_pdf(
        file_content: Union[bytes, BinaryIO], password: str = None
    ) -> str:
        """
        Extract text from a PDF file.

        Args:
            file_content: Either bytes content of the PDF or a file-like object
            password: Optional password if the PDF is encrypted

        Returns:
            str: The extracted text from the PDF
        """
        try:
            # If we get bytes, convert to file-like object
            if isinstance(file_content, bytes):
                file_content = io.BytesIO(file_content)

            # Create PDF reader object
            pdf = PdfReader(file_content)

            # If the PDF is encrypted and a password is provided, try to decrypt it
            if pdf.is_encrypted and password:
                pdf.decrypt(password)

            # Extract text from all pages
            text_content = []
            for _, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    text_content.append(text)

            return "\n\n".join(text_content)
        except Exception as e:
            raise ValueError(f"Error extracting text from PDF: {str(e)}")

    @staticmethod
    def extract_pdf_metadata(file_content: Union[bytes, BinaryIO]) -> Dict[str, Any]:
        """
        Extract metadata from a PDF file.

        Args:
            file_content: Either bytes content of the PDF or a file-like object

        Returns:
            Dict: Document metadata including author, creation date, etc.
        """
        try:
            # If we get bytes, convert to file-like object
            if isinstance(file_content, bytes):
                file_content = io.BytesIO(file_content)

            pdf = PdfReader(file_content)

            # Extract metadata from info dictionary
            metadata = {}
            if pdf.metadata:
                for key, value in pdf.metadata.items():
                    # Convert /Key format to regular key format
                    clean_key = key.strip("/") if isinstance(key, str) else key
                    metadata[clean_key] = value

            # Add other useful information
            metadata["Pages"] = len(pdf.pages)
            metadata["Encrypted"] = pdf.is_encrypted

            return metadata
        except Exception as e:
            raise ValueError(f"Error extracting metadata from PDF: {str(e)}")

    @staticmethod
    def extract_form_fields(
        file_content: Union[bytes, BinaryIO], clean_output: bool = True
    ) -> Dict[str, Any]:
        """
        Extract form fields from a PDF file.
        Particularly useful for account opening forms and financial documents.

        Args:
            file_content: Either bytes content of the PDF or a file-like object
            clean_output: If True, returns only field names and values (simplified format)
                        If False, returns the raw field data

        Returns:
            Dict: Form field names and their values
        """
        try:
            # If we get bytes, convert to file-like object
            if isinstance(file_content, bytes):
                file_content = io.BytesIO(file_content)

            pdf = PdfReader(file_content)

            # Get form fields if they exist
            form_data = {}
            raw_fields = pdf.get_fields() or {}

            if clean_output:
                # Process and clean form fields
                for field_name, field_data in raw_fields.items():
                    # Extract the actual field name from the '/T' key
                    name = field_data.get("/T", field_name).strip("/")

                    # Extract the value based on field type
                    field_type = field_data.get("/FT")

                    # Handle different field types
                    if field_type == "/Tx":  # Text field
                        value = field_data.get("/V", "")
                        if isinstance(value, str):
                            value = value.strip("/")
                    elif field_type == "/Btn":  # Button (checkbox, radio)
                        value = field_data.get("/V", "") == "/Yes"
                    elif field_type == "/Sig":  # Signature field
                        # Check if the signature field has content
                        if "/V" in field_data and field_data["/V"] is not None:
                            value = True  # Signature exists
                        else:
                            value = False  # No signature
                    else:
                        # For other field types, just get the raw value
                        value = field_data.get("/V", "")
                        if isinstance(value, str):
                            value = value.strip("/")

                    form_data[name] = value
            else:
                # Return raw field data
                form_data = raw_fields

            # Check for signature fields specifically
            signature_fields = {}
            for field_name, field_data in raw_fields.items():
                if field_data.get("/FT") == "/Sig":
                    name = field_data.get("/T", field_name).strip("/")
                    has_signature = "/V" in field_data and field_data["/V"] is not None
                    signature_fields[name] = has_signature

            # Check for embedded signatures (not form fields)
            embedded_signature_found = False
            signature_section_patterns = [
                r"(?i)specimen\s+signature",
                r"(?i)signature\s+specimen",
                r"(?i)signature\s+of\s+applicant",
                r"(?i)customer\s+signature",
            ]

            # Check text content for signature sections
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text() or ""

                # Look for signature section patterns in the text
                for pattern in signature_section_patterns:
                    if re.search(pattern, text):
                        # If we find a signature section, check for images or XObject references
                        if "/Resources" in page and "/XObject" in page["/Resources"]:
                            # XObject can be images or other embedded objects
                            embedded_signature_found = True
                            break

                if embedded_signature_found:
                    break

            # Add embedded signature detection to the output
            if embedded_signature_found:
                signature_fields["specimen_signature"] = True

            if signature_fields:
                form_data["_signature_fields"] = signature_fields

            # Check for form fields related to signatures even if they're not signature type fields
            for field_name, value in form_data.items():
                if (
                    "signature" in field_name.lower() or "sign" in field_name.lower()
                ) and value:
                    if "_signature_fields" not in form_data:
                        form_data["_signature_fields"] = {}
                    form_data["_signature_fields"][field_name] = True

            return form_data
        except Exception as e:
            raise ValueError(f"Error extracting form fields from PDF: {str(e)}")

    @staticmethod
    def extract_client_data_from_pdf(data: bytes) -> ClientAccount:
        """
        Parse banking form PDF data and extract information into a ClientAccount object.

        Args:
            data: Bytes of the PDF file

        Returns:
            ClientAccount: Populated client account object
        """
        client_account = ClientAccount()
        pdf_file = BytesIO(data)

        # Extract form fields with clean_output=True for simplified output
        form_data = ClientAccountParser.extract_form_fields(pdf_file, clean_output=True)

        # If we couldn't detect a signature in the form fields, try text-based detection
        has_signature = False
        if "_signature_fields" not in form_data:
            # Reset the file pointer to the beginning
            pdf_file.seek(0)

            # Extract text from the PDF to look for signature sections
            text = ClientAccountParser.extract_text_from_pdf(pdf_file)

            # Look for common signature section indicators in the text
            signature_patterns = [
                r"(?i)specimen\s+signature",
                r"(?i)signature\s+specimen",
                r"(?i)signature\s+of\s+applicant",
                r"(?i)customer\s+signature",
                r"(?i)sign\s+here",
            ]

            for pattern in signature_patterns:
                if re.search(pattern, text):
                    form_data["_signature_fields"] = {"specimen_signature": True}
                    has_signature = True
                    break

        # Map form data to ClientAccount fields
        # Account holder information
        if "account_name" in form_data:
            client_account.account_name = form_data.get("account_name")
        if "account_holder_name" in form_data:
            client_account.account_holder_name = form_data.get("account_holder_name")
        if "account_holder_surname" in form_data:
            client_account.account_holder_surname = form_data.get(
                "account_holder_surname"
            )
        if "passport_number" in form_data:
            client_account.passport_number = form_data.get("passport_number")

        # Try to find name if specific field wasn't found
        for field_name in form_data:
            if client_account.name is None and any(
                name_field in field_name.lower() for name_field in ["name", "holder"]
            ):
                client_account.name = form_data.get(field_name)
                break

        # Currency preferences
        if "chf" in form_data:
            client_account.chf = bool(form_data.get("chf"))
        if "eur" in form_data:
            client_account.eur = bool(form_data.get("eur"))
        if "usd" in form_data:
            client_account.usd = bool(form_data.get("usd"))
        if "other_ccy" in form_data:
            client_account.other_ccy = form_data.get("other_ccy")

        # Address information
        if "building_number" in form_data:
            client_account.building_number = form_data.get("building_number")
        if "postal_code" in form_data:
            client_account.postal_code = form_data.get("postal_code")
        if "city" in form_data:
            client_account.city = form_data.get("city")
        if "country" in form_data:
            client_account.country = form_data.get("country")
        if "street_name" in form_data:
            client_account.street_name = form_data.get("street_name")

        # Contact information
        if "phone_number" in form_data:
            client_account.phone_number = form_data.get("phone_number")
        if "email" in form_data:
            client_account.email = form_data.get("email")

        # Signature information
        if "_signature_fields" in form_data:
            signature_fields = form_data.get("_signature_fields", {})
            if isinstance(signature_fields, dict):
                client_account._signature_fields.specimen_signature = (
                    signature_fields.get("specimen_signature", False)
                )
                client_account._signature_fields._signature_fields = (
                    has_signature or any(signature_fields.values())
                )

        return client_account

    @staticmethod
    def parse(pdf_path: Path) -> ClientAccount:
        """Parse the client account pdf file and return a ClientAccount object"""
        # Read the PDF file
        with open(pdf_path, "rb") as file:
            return ClientAccountParser.extract_client_data_from_pdf(file.read())


if __name__ == "__main__":
    # Example usage:
    # Set default paths
    default_input_path = "C:\\Users\\jekatrinaj\\swisshacks\\data\\level_5\\account.pdf"
    default_output_path = (
        "C:\\Users\\jekatrinaj\\swisshacks\\data\\level_5\\account.json"
    )

    # Setup argument parser
    parser = argparse.ArgumentParser(
        description="Parse client account form and convert to JSON"
    )
    parser.add_argument(
        "--input",
        "-i",
        default=default_input_path,
        help="Path to the input account form pdf file",
    )
    parser.add_argument(
        "--output",
        "-o",
        default=default_output_path,
        help="Path to save the output JSON file",
    )

    # Parse arguments
    args = parser.parse_args()
    input_path = args.input
    output_json_path = args.output

    client_account = ClientAccountParser.parse(input_path)

    # Save JSON data to file
    json_data = client_account.to_json(indent=2, ensure_ascii=False)

    # Save to file if path provided
    with open(output_json_path, "w", encoding="utf-8") as json_file:
        json_file.write(json_data)
    print(f"JSON data saved to {output_json_path}")
