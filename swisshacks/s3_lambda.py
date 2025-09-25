import json
import logging
import concurrent.futures
import storage

from data_parsing.parse_passport_openai import parse_png

# Set up logging
logger = logging.getLogger(__name__)


def parse_s3_passport(passport_key):
    # Get the image data from S3
    image_data = storage.read_object(passport_key)
    json_key = passport_key.replace("passport.png", "passport.json")
    if storage.check_object_exists(json_key):
        return

    # Process the passport image
    passport_data = parse_png(image_data)

    # Store the processed data
    assert storage.store_object(json.dumps(passport_data), json_key)
    print(f"Processed passport file: {json_key}")


def parse_s3_passports(prefix: str = "train/") -> int:
    """
    Process all passport.png files in S3 under the given prefix and store results as JSON.

    Args:
        prefix: S3 prefix to search for passport.png files (default: "" which means all)

    Returns:
        Number of processed files
    """
    # List all objects with the given prefix
    all_objects = storage.list_objects(prefix=prefix)

    # Filter objects to find passport.png files
    passport_objects = [obj for obj in all_objects if obj.endswith("passport.png")]
    passport_objects = sorted(passport_objects, key=lambda x: int(x.split("/")[-2]))

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        # Submit tasks to the thread pool
        executor.map(parse_s3_passport, passport_objects)

    print(f"Processed {len(passport_objects)} passport files")
    return len(passport_objects)


if __name__ == "__main__":
    # Example usage
    parse_s3_passports("train/")
