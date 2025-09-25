import requests
import json
import time
from dotenv import load_dotenv
import hashlib
from pathlib import Path
import os

# Use absolute imports with the package structure
from swisshacks.decode_game_files import process_json_file
from swisshacks.data_parsing.client_profile_parser import ClientProfileParser
from swisshacks.data_parsing.client_account_parser import ClientAccountParser
from swisshacks.data_parsing.client_description_parser import ClientDescriptionParser
from swisshacks.data_parsing.parse_passport_openai import parse_png_to_json
from swisshacks.model.rule_based_model import SimpleModel
from swisshacks.client_data.client_data import ClientData
from swisshacks.storage import store_dict
from swisshacks import trainset

# Get the project root directory (assuming scripts is directly under project root)
PROJECT_ROOT = Path(__file__).parent.parent.absolute()

# Load .env file from project root
print(f"Env path: {os.path.join(PROJECT_ROOT, '.env')}")
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))


data_dir = PROJECT_ROOT / "data"
# API configuration
BASE_URL = "https://hackathon-api.mlo.sehlat.io"
API_KEY = os.getenv("JULIUS_BAER_API_KEY")
HEADERS = {"x-api-key": API_KEY}


def save_to_json(data, output_path):
    """Save an object with to_json method to a JSON file"""
    with open(output_path, "w", encoding="utf-8") as json_file:
        json_file.write(data.to_json(indent=2, ensure_ascii=False))


def start_game():
    """Start a new game session and return session details"""

    url = f"{BASE_URL}/game/start"
    payload = {"player_name": "3plus1"}

    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        response.raise_for_status()
        response_data = response.json()

        print("Game started successfully!")
        print(f"Session ID: {response_data['session_id']}")
        print(f"Initial client ID: {response_data['client_id']}")

        return response_data

    except requests.exceptions.RequestException as e:
        print(f"Error starting game: {e}")
        return None


def send_decision(session_id, client_id, decision):
    """Send the decision (Accept or Reject) to the API and return the response"""

    url = f"{BASE_URL}/game/decision"

    picked_decision = "Accept" if decision == 1 else "Reject"

    payload = {
        "decision": picked_decision,
        "client_id": client_id,
        "session_id": session_id,
    }

    # Return also the decision (1 for Accept, 0 for Reject)
    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        response.raise_for_status()
        response_data = response.json()  # Converts the response to a dict object

        return response_data

    except requests.exceptions.RequestException as e:
        print(f"Error making decision: {e}")
        return None


def toMd5(client_data: dict):
    """Convert client data to MD5 hash"""
    json_string = json.dumps(client_data, sort_keys=True)
    # Compute the MD5 hash
    md5_hash = hashlib.md5(json_string.encode("utf-8")).hexdigest()
    return md5_hash


def save_result(client_data, score, status, answer):
    """Save the result"""

    result = "1" if status else "0"

    # Format the score as a two-digit string
    formatted_score = str(score).zfill(2)

    print(f"test/{result}/{formatted_score}/{toMd5(client_data)}")
    store_dict(client_data, f"test/{result}/{formatted_score}/{toMd5(client_data)}")
    # print(f"\nlevel_{formatted_score}-answer_{answer}_result_{result}.json")


def run_game():
    """Main script"""
    game_data = start_game()

    if not game_data:
        print("Failed to start game. Exiting.")
        return

    print("\nGame started ...")

    session_id = game_data["session_id"]
    current_client_id = game_data["client_id"]
    client_data = game_data["client_data"]
    score = 0  # Starting score

    # Calculate delay to achieve 55 requests per minute
    delay = 60 / 55  # seconds per request

    # Run the queries
    queries_made = 0
    start_time = time.time()

    predictor = SimpleModel()

    while True:  # Run indefinitely until game over
        print(f"\nChecking result for level {score} ...")

        output_dir = data_dir / f"level_{score}"
        process_json_file(client_data, output_dir)

        ### Parse saved documents
        # Parse the PNG passport image and save as JSON
        passport_png_path = output_dir / "passport.png"
        parsed_png = parse_png_to_json(passport_png_path)
        save_to_json(parsed_png, output_dir / "passport.json")

        # Parse the PDF clien account banking form and save as JSON
        client_account = ClientAccountParser.parse(output_dir / "account.pdf")
        save_to_json(client_account, output_dir / "account.json")

        # Parse the client profile DOCX file and save as JSON
        client_profile = ClientProfileParser.parse(output_dir / "profile.docx")
        save_to_json(client_profile, output_dir / "profile.json")

        # Parse the TXT file and save as JSON
        client_description = ClientDescriptionParser.parse(
            output_dir / "description.txt"
        )
        save_to_json(client_description, output_dir / "description.json")

        try:
            client_file = ClientData(
                client_file=str(output_dir),
                account_form=client_account,
                client_description=client_description,
                client_profile=client_profile,
                passport=parsed_png,
            )
            decision = predictor.predict(client_file)
        except AssertionError as e:
            print(f"Error in client data: {e}")
            decision = 0  # Default to Reject if there's an error

        print(f"Decision: {decision}")
        response = send_decision(session_id, current_client_id, decision)

        queries_made += 1
        client_data = response.get("client_data", {})
        score = response["score"]

        # Check if game is over
        if response["status"] == "gameover":
            print(f"\nGame over! Final score: {score}")

            # Save the result
            save_result(response, score + 1, 0, decision)
            break

        else:
            # Update client ID and score for next request immediately after receiving the response
            current_client_id = response["client_id"]

            score = response["score"]

            # Save the result
            save_result(client_data, score, 1, decision)

        # Calculate time to sleep to maintain 55 requests per minute
        elapsed = time.time() - start_time
        expected_elapsed = queries_made * delay
        sleep_time = max(0, expected_elapsed - elapsed)

        if sleep_time > 0:
            time.sleep(sleep_time)

    # Print summary
    elapsed_time = time.time() - start_time
    print(f"\nCompleted {queries_made} queries in {elapsed_time:.2f} seconds")
    print(f"Rate: {queries_made / elapsed_time * 60:.2f} queries per minute")


def run_game_continuously():
    """Run the game continuously, creating a new game every time it stops."""

    while True:
        run_game()
        print("\nRestarting game in 3 seconds...")
        time.sleep(1)  # Delay before starting a new game


def eval_on_trainset():
    train_iterator = trainset.TrainIterator(limit=10)
    for path in train_iterator:
        input_dir = Path(path)
        output_dir = data_dir / f"train_{path.split('/')[-1]}"

        # Parse the PDF banking form and save as JSON
        client_account = ClientAccountParser.parse(output_dir / "account.pdf")
        save_to_json(client_account, output_dir / "account.json")

        # Parse the DOCX file and save as JSON
        client_profile = ClientProfileParser.parse(output_dir / "profile.docx")
        save_to_json(client_profile, output_dir / "profile.json")

        # Parse the TXT file and save as JSON
        client_description = ClientDescriptionParser.parse(
            output_dir / "description.txt"
        )
        save_to_json(client_description, output_dir / "description.json")

        train_iterator.predict()
        print(train_iterator, input_dir)


if __name__ == "__main__":
    run_game()
    # run_game_continuously()
    # eval_on_trainset()
