#!/usr/bin/env python3
import json
import os
from pathlib import Path
from client_data.client_data import ClientData
from model.rule_based_model import (
    SimpleModel, 
    flag_missing_values, 
    check_data_inconsistencies,
    check_wealth_inconsistencies,
    check_employment_inconsistencies,
    check_education_inconsistencies,
    check_family_inconsistencies,
    check_country_inconsistencies
)

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
        print(f"Error loading data from {level_dir}: {e}")
        return None


def test_validation_rules(client_data, client_name):
    """
    Test all validation rules on a client data.
    
    Args:
        client_data (ClientData): The client data to validate
        client_name (str): Name of the client/level for reporting
        
    Returns:
        dict: A dictionary with validation results
    """
    results = {
        "client": client_name,
        "validations": {
            "missing_values": flag_missing_values(client_data),
            "data_inconsistencies": check_data_inconsistencies(client_data),
            "wealth_inconsistencies": check_wealth_inconsistencies(client_data),
            "employment_inconsistencies": check_employment_inconsistencies(client_data),
            "education_inconsistencies": check_education_inconsistencies(client_data),
            "family_inconsistencies": check_family_inconsistencies(client_data),
            "country_inconsistencies": check_country_inconsistencies(client_data)
        }
    }
    
    # Add overall validation result
    model = SimpleModel()
    results["overall_valid"] = bool(model.predict(client_data))
    
    return results


def main():
    """
    Main function to test validations on all available client data.
    """
    # Get the project directory
    project_dir = Path(__file__).parent.parent.resolve().absolute()
    data_dir = project_dir / "data"
    
    # Create a dictionary to store all validation results
    all_results = {}
    
    # Test validation for each level directory
    for i in range(10):  # Assuming levels 0-9
        level_dir = data_dir / f"level_{i}"
        if level_dir.exists():
            print(f"Testing validation rules for level_{i}...")
            client_data = load_client_data(level_dir)
            if client_data:
                results = test_validation_rules(client_data, f"level_{i}")
                all_results[f"level_{i}"] = results
                
                # Print results summary
                print(f"  Overall validation: {'VALID' if results['overall_valid'] else 'INVALID'}")
                for rule, result in results["validations"].items():
                    status = "FAILED" if result else "PASSED"
                    print(f"  {rule.replace('_', ' ').title()}: {status}")
                print()
    
    # Save all results to a JSON file
    with open(project_dir / "validation_results.json", "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"All validation results saved to {project_dir / 'validation_results.json'}")


if __name__ == "__main__":
    main()