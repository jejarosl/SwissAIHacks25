import os
import random
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).parent.parent.absolute()

# Load .env file from project root
print(f"Env path: {os.path.join(PROJECT_ROOT, '.env')}")
load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
import storage


FOLDER = f"{os.path.dirname(__file__)}/../train/"

random.seed(42)  # Set seed for reproducibility


class TrainIterator:

    def __init__(self, limit=None, minkey=None, maxkey=None):
        self.paths = [os.path.join(FOLDER, x, "0", y) \
                        for x in "01" for y in os.listdir(os.path.join(FOLDER, x, "0")) \
                        if (maxkey is None or int(y) < maxkey)
                        and (minkey is None or int(y) >= minkey)]
        random.shuffle(self.paths)
        self.current_index = 0
        self.predictions = []
        self.accuracy = None
        self.false_negatives = []
        self.false_positives = []
        if limit is not None:
            self.paths = self.paths[:limit]

    def __iter__(self):
        if self.accuracy is not None:
            raise ValueError("Iterator has already been evaluated.")
        return self

    def __next__(self):
        if self.current_index < len(self.paths):
            item = self.paths[self.current_index]
            self.current_index += 1
            return item
        else:
            print(self)
            raise StopIteration

    def predict(self, prediction: bool):
        """
        Store the prediction for the current item.
        """
        assert isinstance(prediction, bool), "Prediction must be a boolean value."
        if self.current_index == 0:
            raise ValueError("No current item to predict for.")
        if len(self.predictions) >= self.current_index:
            raise ValueError("Prediction already stored.")
        self.predictions.append(prediction)

    def __str__(self):
        self.accuracy, self.false_positives, self.false_negatives = \
            evaluate_predictions(self.paths[:len(self.predictions)], self.predictions)
        return f"Accuracy is {round(100*self.accuracy, 1):.1f}%"


def load_files(directory: str) -> dict:
    """
    Load files from the specified folder and return a dict of file paths.
    """
    files = {}
    for filenames in os.listdir(directory):
        for filename in filenames:
            with open(os.path.join(directory, filename), 'rb') as file:
                files[filename] = file.read()
    return files


def evaluate_predictions(paths: list[str], predictions: list[bool]) -> tuple[float, list[str], list[str]]:
    """
    Evaluate the predictions against the groundtruths.
    Returns:
        Tuple containing:
            - Accuracy of the predictions.
            - List of false positive paths.
            - List of false negative paths.
    """
    if len(paths) != len(predictions):
        raise ValueError(f"Groundtruth and predictions must have the same length: {len(paths)} vs {len(predictions)}")

    false_negatives = []
    false_positives = []
    true_count = 0
    for path, prediction in zip(paths, predictions):
        # Split on either \ or / depending on the path format
        path_parts = path.replace('\\', '/').split('/')
        gt = {"0": False, "1": True}[path_parts[-3]]
        if gt == prediction:
            true_count += 1
        else:
            if gt:
                false_negatives.append(path)
            else:
                false_positives.append(path)
    return true_count / len(predictions), false_positives, false_negatives


def upload_dataset(prefix="train/"):
    """
    Upload the dataset to S3, recursively traversing all subdirectories.
    """
    uploaded_files = 0
    for root, dirs, files in os.walk(FOLDER):
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, FOLDER)

            # Read and upload file using the storage module
            with open(file_path, 'rb') as handle:
                storage.store_object(handle.read(), f"{prefix}{relative_path}")

            uploaded_files += 1
            if uploaded_files % 100 == 0:
                print(f"Uploaded {uploaded_files} files to storage")

    print(f"Uploaded {uploaded_files} files to storage")
    return uploaded_files


def download_dataset(prefix="train/"):
    """
    Download the dataset from S3, preserving directory structure.
    Args:
        prefix: Storage prefix where files were uploaded (default: 'train/')
    Returns:
        Number of downloaded files
    """
    downloaded_files = 0
    # Get list of all objects in storage with the given prefix
    objects = storage.list_objects(prefix=prefix)

    for obj_key in objects:
        # Calculate the local path where the file should be saved
        relative_path = obj_key[len(prefix):]  # Remove prefix to get relative path
        local_path = os.path.join(FOLDER, relative_path)
        downloaded_files += 1

        if os.path.exists(local_path):
            continue

        # Create directory structure if it doesn't exist
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

        # Download the file from storage
        content = storage.read_object(obj_key)

        # Save the file locally
        with open(local_path, 'wb') as handle:
            handle.write(content)

        if downloaded_files % 100 == 0:
            print(f"Downloaded {downloaded_files} files from storage")

    print(f"Downloaded {downloaded_files} files from storage")
    return downloaded_files


if __name__ == "__main__":
    # Download dataset only once
    # upload_dataset()
    download_dataset()

    # Example usage of TrainIterator
    train_iterator = TrainIterator()
    for path in train_iterator:
        print(path)
        # Simulate prediction is True
        train_iterator.predict(True)
    print(train_iterator.false_negatives[:10])
    print(train_iterator.false_positives[:10])
