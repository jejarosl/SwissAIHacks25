#!/usr/bin/env python3
import json
import os
import logging
from pathlib import Path
from client_data.client_data import ClientData
from model.rule_based_model import (
    are_strings_ocr_equivalent,
    are_names_similar,
    are_dates_ocr_equivalent,
    is_nationality_equivalent
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # DEBUG level to see all the detailed matching logic
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("passport_ocr_debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("passport_ocr_test")

def load_client_data(level_dir):
    """
    Load client data from a specific level directory.
    
    Args:
        level_dir (str): Path to the level directory
        
    Returns:
        ClientData: A ClientData object with data from the directory
    """
    try:
        # Load account data
        with open(os.path.join(level_dir, "account.json"), "r") as f:
            account_data = json.load(f)
            
        # Load description data
        with open(os.path.join(level_dir, "description.json"), "r") as f:
            description_data = json.load(f)
            
        # Load passport data
        with open(os.path.join(level_dir, "passport.json"), "r") as f:
            passport_data = json.load(f)
            
        # Load profile data
        with open(os.path.join(level_dir, "profile.json"), "r") as f:
            profile_data = json.load(f)
            
        # Create ClientData object
        return ClientData(
            client_file=level_dir,
            account_form=account_data,
            client_description=description_data,
            client_profile=profile_data,
            passport=passport_data
        )
    except Exception as e:
        logger.error(f"Error loading data from {level_dir}: {e}")
        return None

def test_passport_ocr_comparison(client_data):
    """
    Test OCR comparison functions specifically on passport data.
    
    Args:
        client_data (ClientData): The client data to test
        
    Returns:
        dict: Results of the OCR comparison tests
    """
    results = {"tests": []}
    
    # Test passport number comparison
    passport_id = client_data.client_profile.get("passport_id")
    passport_number_account = client_data.account_form.get("passport_number")
    passport_number_passport = client_data.passport.get("passport_number")
    
    test_result = {
        "test": "Passport Number Comparison",
        "profile_value": passport_id,
        "passport_value": passport_number_passport,
        "account_value": passport_number_account,
        "profile_vs_passport": are_strings_ocr_equivalent(passport_id, passport_number_passport),
        "profile_vs_account": are_strings_ocr_equivalent(passport_id, passport_number_account)
    }
    results["tests"].append(test_result)
    
    # Test name comparison
    first_name = client_data.client_profile.get("first_name", "")
    last_name = client_data.client_profile.get("last_name", "")
    full_name = f"{first_name} {last_name}".strip()
    
    passport_given_name = client_data.passport.get("given_name", "")
    passport_surname = client_data.passport.get("surname", "")
    account_name = client_data.account_form.get("account_name", "")
    account_surname = client_data.account_form.get("account_holder_surname", "")
    
    test_result = {
        "test": "First Name Comparison",
        "profile_value": first_name,
        "passport_value": passport_given_name,
        "result": are_names_similar(first_name, passport_given_name)
    }
    results["tests"].append(test_result)
    
    test_result = {
        "test": "Last Name Comparison",
        "profile_value": last_name,
        "passport_value": passport_surname,
        "account_value": account_surname,
        "profile_vs_passport": are_names_similar(last_name, passport_surname),
        "profile_vs_account": are_names_similar(last_name, account_surname),
        "passport_vs_account": are_names_similar(passport_surname, account_surname)
    }
    results["tests"].append(test_result)
    
    test_result = {
        "test": "Full Name Comparison",
        "profile_value": full_name,
        "account_value": account_name,
        "result": are_names_similar(full_name, account_name)
    }
    results["tests"].append(test_result)
    
    # Test birth date comparison
    profile_birth_date = client_data.client_profile.get("birth_date", "")
    passport_birth_date = client_data.passport.get("birth_date", "")
    
    test_result = {
        "test": "Birth Date Comparison",
        "profile_value": profile_birth_date,
        "passport_value": passport_birth_date,
        "result": are_dates_ocr_equivalent(profile_birth_date, passport_birth_date)
    }
    results["tests"].append(test_result)
    
    # Test nationality comparison
    nationality = client_data.client_profile.get("nationality", "")
    citizenship = client_data.passport.get("citizenship", "")
    
    test_result = {
        "test": "Nationality Comparison",
        "profile_value": nationality,
        "passport_value": citizenship,
        "result": is_nationality_equivalent(nationality, citizenship)
    }
    results["tests"].append(test_result)
    
    return results

def test_detailed_ocr_equivalence():
    """
    Test detailed OCR equivalence with specific examples from client data.
    """
    logger.info("Testing specific OCR equivalence examples...")
    
    # Test surname OCR errors
    logger.info("Testing surname OCR errors:")
    surname_tests = [
        ("Hoffmann", "HOFFMAI", True),  # Should match with OCR tolerance
        ("Hoffmann", "Hoffmnn", True),  # Should match with OCR tolerance
        ("Müller", "MULLER", True),     # Should match with OCR tolerance
        ("Jensen", "JENSEM", True),     # Should match with OCR tolerance
        ("Smith", "SNITH", True),       # Should match with OCR tolerance
        ("Brown", "GREEN", False),      # Should not match - completely different
    ]
    
    for test in surname_tests:
        original, ocr_read, expected_match = test
        result = are_names_similar(original, ocr_read)
        status = "✓" if result == expected_match else "✗"
        logger.info(f"{status} '{original}' vs '{ocr_read}': expected {expected_match}, got {result}")
    
    # Test date OCR errors
    logger.info("\nTesting date OCR errors:")
    date_tests = [
        ("2000-12-24", "24-Dec-2ooo", True),  # Should match with OCR tolerance
        ("1990-05-15", "15-May-l99O", True),  # Should match with OCR tolerance
        ("1972-03-07", "07-Mar-1972", True),  # Different format but same date
        ("2001-01-30", "20-Jan-2001", False), # Different day
        ("1985-11-12", "12-Dec-1985", False), # Different month
    ]
    
    for test in date_tests:
        original, ocr_read, expected_match = test
        result = are_dates_ocr_equivalent(original, ocr_read)
        status = "✓" if result == expected_match else "✗"
        logger.info(f"{status} '{original}' vs '{ocr_read}': expected {expected_match}, got {result}")
    
    # Test passport number OCR errors
    logger.info("\nTesting passport number OCR errors:")
    passport_tests = [
        ("TR4441465", "TR444I465", True),     # Should match with OCR tolerance
        ("AB1234567", "A81234567", True),     # Should match with OCR tolerance
        ("CD5678901", "CDS67890l", True),     # Should match with OCR tolerance
        ("EF9012345", "EF9O12345", True),     # Should match with OCR tolerance
        ("GH3456789", "GN3456789", False),    # Should not match - too many differences
    ]
    
    for test in passport_tests:
        original, ocr_read, expected_match = test
        result = are_strings_ocr_equivalent(original, ocr_read)
        status = "✓" if result == expected_match else "✗"
        logger.info(f"{status} '{original}' vs '{ocr_read}': expected {expected_match}, got {result}")

def main():
    """
    Main function to test passport OCR functionality.
    """
    # Get the project directory
    project_dir = Path(__file__).parent.parent.resolve().absolute()
    level_9_dir = project_dir / "data" / "level_9"
    
    # Test specific OCR equivalence examples
    test_detailed_ocr_equivalence()
    
    # Test with the level_9 client data
    if level_9_dir.exists():
        logger.info(f"\nTesting with level_9 client data ({level_9_dir})...")
        
        client_data = load_client_data(level_9_dir)
        if client_data:
            results = test_passport_ocr_comparison(client_data)
            
            # Print results in a readable format
            logger.info("\nPassport OCR Comparison Results:")
            for test in results["tests"]:
                logger.info(f"Test: {test['test']}")
                for key, value in test.items():
                    if key != "test":
                        logger.info(f"  {key}: {value}")
                logger.info("")
            
            # Save results to a JSON file
            with open(project_dir / "passport_ocr_results.json", "w") as f:
                json.dump(results, f, indent=2)
            logger.info(f"Results saved to {project_dir / 'passport_ocr_results.json'}")
    else:
        logger.error(f"Level 9 directory not found: {level_9_dir}")

if __name__ == "__main__":
    main()