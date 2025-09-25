from pathlib import Path
from dataclasses import dataclass
from swisshacks.client_data.client_profile import ClientProfile
from swisshacks.client_data.client_account import ClientAccount
from swisshacks.client_data.client_description import ClientDescription
from swisshacks.client_data.client_passport import ClientPassport

PROJECT_DIR = Path(__file__).parent.parent.parent.resolve().absolute()

data_dir = PROJECT_DIR / "data"


@dataclass
class ClientData:
    """Client data."""

    # Client identifier.
    client_file: str
    # Parsed client account data (from pdf).
    account_form: ClientAccount
    # Parsed client account data (from txt).
    client_description: ClientDescription
    # Parsed client profile data (from docx).
    client_profile: ClientProfile
    # Parsed passport data (from png).
    passport: ClientPassport
    # Label (0 or 1) corresponding to the ground truth information used
    # for training. May be none.
    label: int | None = None

    is_valid: bool = True

    def __post_init__(self):

        if self.account_form is None:
            print("Account form cannot be None")
            self.is_valid = False
        if not self.account_form.is_valid():
            print("Account form is invalid")
            self.is_valid = False

        if self.client_description is None:
            print("Client description cannot be None")
            self.is_valid = False
        if not self.client_description.is_valid():
            print("Client description is invalid")
            self.is_valid = False

        if self.client_profile is None:
            print("Client profile cannot be None")
            self.is_valid = False
        if not self.client_profile.is_valid():
            print("Client profile is invalid")
            self.is_valid = False

        if self.passport is None:
            print("Passport cannot be None")
            self.is_valid = False
        if not self.passport.is_valid():
            print("Passport is invalid")
            self.is_valid = False
