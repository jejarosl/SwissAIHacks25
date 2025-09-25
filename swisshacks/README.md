# SwissHacks Package

A Python package for the Julius Baer hackathon challenge that handles client data processing and validation.

## Installation

Install the package in development mode:

```bash
pip install -e .
```

This will install the package in development mode, so changes to the code will be reflected immediately without needing to reinstall.

## Usage

After installation, you can use the package in your Python code:

```python
from swisshacks.play_game import run_game
from swisshacks.client_data.client_data import ClientData
from swisshacks.data_parsing.client_profile_parser import ClientProfileParser

# Play the game
run_game()

# Parse a client profile
profile = ClientProfileParser.parse("path/to/profile.docx")
```

## Command-line Tools

After installation, the following command-line tools are available:

- `swisshacks-play` - Run the game once
- `swisshacks-continuous` - Run the game continuously
- `swisshacks-evaluate` - Evaluate the model on the training set
- `swisshacks-create-test` - Create test data
- `swisshacks-validate` - Run validations

## Project Structure

```
swisshacks/
├── __init__.py             # Package initialization
├── play_game.py            # Main game loop
├── storage.py              # Storage functionality
├── trainset.py             # Training set utilities
├── client_data/            # Client data models
│   ├── __init__.py
│   ├── client_account.py
│   ├── client_data.py
│   └── ...
├── data_parsing/           # Data parsing utilities
│   ├── __init__.py
│   ├── client_profile_parser.py
│   └── ...
└── model/                  # ML models
    ├── __init__.py
    └── rule_based_model.py
```