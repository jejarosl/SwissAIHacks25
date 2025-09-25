import base64
import os
import mimetypes


def detect_file_type(decoded_data):
    """Try to determine the file type from the first few bytes"""
    # Common file signatures
    signatures = {
        b"%PDF": ".pdf",
        b"\xff\xd8\xff": ".jpg",
        b"\x89PNG": ".png",
        b"GIF8": ".gif",
        b"PK\x03\x04": ".zip",
    }

    for signature, file_ext in signatures.items():
        if decoded_data.startswith(signature):
            return file_ext

    # Fallback to checking content type
    try:
        import magic

        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(decoded_data)
        ext = mimetypes.guess_extension(mime_type)
        if ext:
            return ext
    except ImportError:
        pass

    # Default to txt if we can't determine type
    return ".txt"


def decode_and_save(
    encoded_data, filename_prefix, output_dir="decoded_files", force_extension=None
):
    """Decode base64 data and save it to a file with appropriate extension"""
    if not encoded_data:
        print(f"No data to decode for {filename_prefix}")
        return None

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    try:
        # Convert to bytes if string
        if isinstance(encoded_data, str):
            # Try to handle when the string is already decoded
            try:
                decoded_data = base64.b64decode(encoded_data)
            except Exception:
                print(
                    f"Failed to decode {filename_prefix} as base64, treating as raw text"
                )
                decoded_data = encoded_data.encode("utf-8")
                return save_text_file(encoded_data, filename_prefix, output_dir)
        else:
            decoded_data = base64.b64decode(encoded_data)

        # Try to detect the file type
        file_ext = (
            force_extension if force_extension else detect_file_type(decoded_data)
        )

        # Create output file path
        output_path = os.path.join(output_dir, f"{filename_prefix}{file_ext}")

        # Write to file
        with open(output_path, "wb") as f:
            f.write(decoded_data)

        print(f"Saved decoded data to {output_path}")
        return output_path

    except Exception as e:
        print(f"Error decoding {filename_prefix}: {e}")
        return None


def save_text_file(text_data, filename_prefix, output_dir="decoded_files"):
    """Save plain text data to a file"""
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{filename_prefix}.txt")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text_data)

    print(f"Saved text data to {output_path}")
    return output_path


def process_json_file(client_data, output_dir):
    """Process a JSON file containing encoded data fields"""

    try:
        output_dir.mkdir(exist_ok=True)

        results = {}

        # Process each field in client_data
        for field_name, field_value in client_data.items():
            if field_value:
                # Special handling for profile field to save as docx if needed
                if field_name == "profile":
                    # Profile might be a docx file, so add .docx extension explicitly
                    output_path = decode_and_save(
                        field_value,
                        field_name,
                        str(output_dir),
                        force_extension=".docx",
                    )
                else:
                    output_path = decode_and_save(
                        field_value, field_name, str(output_dir)
                    )

                results[field_name] = output_path

        return results

    except Exception as e:
        print(f"Error processing {output_dir}: {e}")
        return None
