#!/usr/bin/env python3
import json
import os
from pathlib import Path


def create_test_data_with_inconsistencies(source_level_dir, output_dir):
    """
    Create test data with intentional inconsistencies by modifying existing client data.

    Args:
        source_level_dir (str): Path to the source level directory with clean data
        output_dir (str): Path to output directory for test data
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Load all JSON files from the source directory
    try:
        with open(os.path.join(source_level_dir, "account.json"), "r") as f:
            account_data = json.load(f)

        with open(os.path.join(source_level_dir, "description.json"), "r") as f:
            description_data = json.load(f)

        with open(os.path.join(source_level_dir, "passport.json"), "r") as f:
            passport_data = json.load(f)

        with open(os.path.join(source_level_dir, "profile.json"), "r") as f:
            profile_data = json.load(f)
    except Exception as e:
        print(f"Error loading data from {source_level_dir}: {e}")
        return

    # Create a copy of the original data
    modified_profile = profile_data.copy()

    # Test case 1: Missing values
    test_case_1_dir = os.path.join(output_dir, "test_missing_values")
    os.makedirs(test_case_1_dir, exist_ok=True)

    # Remove a required field from profile
    missing_profile = profile_data.copy()
    missing_profile["last_name"] = ""

    # Save the modified files
    with open(os.path.join(test_case_1_dir, "account.json"), "w") as f:
        json.dump(account_data, f, indent=2)
    with open(os.path.join(test_case_1_dir, "description.json"), "w") as f:
        json.dump(description_data, f, indent=2)
    with open(os.path.join(test_case_1_dir, "passport.json"), "w") as f:
        json.dump(passport_data, f, indent=2)
    with open(os.path.join(test_case_1_dir, "profile.json"), "w") as f:
        json.dump(missing_profile, f, indent=2)

    # Test case 2: Data inconsistencies (passport number mismatch)
    test_case_2_dir = os.path.join(output_dir, "test_passport_mismatch")
    os.makedirs(test_case_2_dir, exist_ok=True)

    # Create inconsistent passport numbers
    inconsistent_passport = passport_data.copy()
    inconsistent_passport["passport_number"] = "XX1234567"

    # Save the modified files
    with open(os.path.join(test_case_2_dir, "account.json"), "w") as f:
        json.dump(account_data, f, indent=2)
    with open(os.path.join(test_case_2_dir, "description.json"), "w") as f:
        json.dump(description_data, f, indent=2)
    with open(os.path.join(test_case_2_dir, "passport.json"), "w") as f:
        json.dump(inconsistent_passport, f, indent=2)
    with open(os.path.join(test_case_2_dir, "profile.json"), "w") as f:
        json.dump(profile_data, f, indent=2)

    # Test case 3: Wealth inconsistencies
    test_case_3_dir = os.path.join(output_dir, "test_wealth_inconsistencies")
    os.makedirs(test_case_3_dir, exist_ok=True)

    # Create inconsistency in wealth information
    inconsistent_description = description_data.copy()

    # If inheritance is mentioned in the description but not in profile, or vice versa
    has_inheritance_in_desc = (
        "inheritance" in description_data["Wealth Summary"].lower()
    )
    has_inheritance_in_profile = "Inheritance" in profile_data.get(
        "wealth_info", {}
    ).get("wealth_sources", [])

    if has_inheritance_in_desc and has_inheritance_in_profile:
        # Remove inheritance from description
        inconsistent_description["Wealth Summary"] = inconsistent_description[
            "Wealth Summary"
        ].replace("inheritance", "savings")
        inconsistent_description["Wealth Summary"] = inconsistent_description[
            "Wealth Summary"
        ].replace("inherited", "saved")
    elif has_inheritance_in_desc:
        # Add inheritance to profile
        modified_profile = profile_data.copy()
        if "wealth_info" not in modified_profile:
            modified_profile["wealth_info"] = {}
        if "wealth_sources" not in modified_profile["wealth_info"]:
            modified_profile["wealth_info"]["wealth_sources"] = []
        modified_profile["wealth_info"]["wealth_sources"].append("Inheritance")
        with open(os.path.join(test_case_3_dir, "profile.json"), "w") as f:
            json.dump(modified_profile, f, indent=2)
    else:
        # Add inheritance to description
        inconsistent_description["Wealth Summary"] += (
            " She also inherited a significant sum from her grandparent in 2020."
        )

    # Save the modified files
    with open(os.path.join(test_case_3_dir, "account.json"), "w") as f:
        json.dump(account_data, f, indent=2)
    with open(os.path.join(test_case_3_dir, "description.json"), "w") as f:
        json.dump(inconsistent_description, f, indent=2)
    with open(os.path.join(test_case_3_dir, "passport.json"), "w") as f:
        json.dump(passport_data, f, indent=2)
    if not os.path.exists(os.path.join(test_case_3_dir, "profile.json")):
        with open(os.path.join(test_case_3_dir, "profile.json"), "w") as f:
            json.dump(profile_data, f, indent=2)

    # Test case 4: Employment inconsistencies
    test_case_4_dir = os.path.join(output_dir, "test_employment_inconsistencies")
    os.makedirs(test_case_4_dir, exist_ok=True)

    # Create inconsistency in employment information
    inconsistent_description = description_data.copy()
    inconsistent_profile = profile_data.copy()

    # Get current employment status from profile
    current_status = None
    if inconsistent_profile.get("employment") and inconsistent_profile["employment"]:
        current_status = (
            inconsistent_profile["employment"][0]
            .get("current_status", {})
            .get("status_type", "")
        )

    # Modify employment status in either description or profile
    if current_status == "Employee":
        # Change profile to retired
        if (
            inconsistent_profile.get("employment")
            and inconsistent_profile["employment"]
        ):
            inconsistent_profile["employment"][0]["current_status"]["status_type"] = (
                "Retired"
            )
    elif current_status == "Retired":
        # Change profile to employee
        if (
            inconsistent_profile.get("employment")
            and inconsistent_profile["employment"]
        ):
            inconsistent_profile["employment"][0]["current_status"]["status_type"] = (
                "Employee"
            )
            inconsistent_profile["employment"][0]["employer"] = "ABC Corporation"
            inconsistent_profile["employment"][0]["position"] = "Manager"
    elif current_status == "Not employed":
        # Change description to indicate employment
        inconsistent_description["Occupation History"] = (
            inconsistent_description["Occupation History"]
            .replace(
                "not employed",
                "currently employed as a Marketing Director at XYZ Company",
            )
            .replace("did not start", "started")
        )
    else:
        # Add contradictory employment info to description
        inconsistent_description["Occupation History"] += (
            " They recently retired from their position."
        )

    # Save the modified files
    with open(os.path.join(test_case_4_dir, "account.json"), "w") as f:
        json.dump(account_data, f, indent=2)
    with open(os.path.join(test_case_4_dir, "description.json"), "w") as f:
        json.dump(inconsistent_description, f, indent=2)
    with open(os.path.join(test_case_4_dir, "passport.json"), "w") as f:
        json.dump(passport_data, f, indent=2)
    with open(os.path.join(test_case_4_dir, "profile.json"), "w") as f:
        json.dump(inconsistent_profile, f, indent=2)

    # Test case 5: Education inconsistencies
    test_case_5_dir = os.path.join(output_dir, "test_education_inconsistencies")
    os.makedirs(test_case_5_dir, exist_ok=True)

    # Create inconsistency in education information
    inconsistent_description = description_data.copy()
    inconsistent_profile = profile_data.copy()

    # Get education info from profile
    education_history = inconsistent_profile.get("personal_info", {}).get(
        "education_history", ""
    )

    if education_history:
        # Change school name or graduation year in description
        education_parts = education_history.split("(")
        if len(education_parts) >= 2:
            school_name = education_parts[0].strip()
            graduation_year = education_parts[1].strip().rstrip(")")

            # Modify education info in description
            inconsistent_description["Education Background"] = (
                inconsistent_description["Education Background"]
                .replace(school_name, "Different University")
                .replace(graduation_year, str(int(graduation_year) + 5))
            )
    else:
        # Add education info to profile that's inconsistent with description
        if "personal_info" not in inconsistent_profile:
            inconsistent_profile["personal_info"] = {}
        inconsistent_profile["personal_info"]["education_history"] = (
            "University of Inconsistency (2010)"
        )

    # Save the modified files
    with open(os.path.join(test_case_5_dir, "account.json"), "w") as f:
        json.dump(account_data, f, indent=2)
    with open(os.path.join(test_case_5_dir, "description.json"), "w") as f:
        json.dump(inconsistent_description, f, indent=2)
    with open(os.path.join(test_case_5_dir, "passport.json"), "w") as f:
        json.dump(passport_data, f, indent=2)
    with open(os.path.join(test_case_5_dir, "profile.json"), "w") as f:
        json.dump(inconsistent_profile, f, indent=2)

    print(f"Test data with inconsistencies created in {output_dir}")


def main():
    """
    Main function to create test data with inconsistencies.
    """
    # Get the project directory
    project_dir = Path(__file__).parent.parent.resolve().absolute()
    data_dir = project_dir / "data"

    # Choose a level directory to use as source
    source_level_dir = data_dir / "level_9"

    # Create a test data directory
    test_data_dir = project_dir / "test_data"

    # Create test data with inconsistencies
    create_test_data_with_inconsistencies(source_level_dir, test_data_dir)


if __name__ == "__main__":
    main()
