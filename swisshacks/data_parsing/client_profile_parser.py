import docx
import logging
import argparse  # Add import for argument parsing
from swisshacks.client_data.client_profile import (
    ClientProfile,
    Employment,
    MaritalStatus,
    EmploymentType,
    RiskProfile,
    MandateType,
    InvestmentExperience,
    InvestmentHorizon,
    Gender,
    WealthRange,
    IncomeRange,
    WealthSource,
)


class ClientProfileParser:
    """Parser for client profile docx files"""

    # Checkbox symbol constant
    CHECKBOX_CHECKED = "☒"
    
    # Table index constants for better readability
    TABLE_BASIC_INFO = 1
    TABLE_CONTACT_INFO = 3
    TABLE_PEP_STATUS = 5
    TABLE_MARITAL_EDUCATION = 6
    TABLE_EMPLOYMENT_PART1 = 8
    TABLE_EMPLOYMENT_PART2 = 9
    TABLE_WEALTH_INFO = 11
    TABLE_INCOME_INFO = 13
    TABLE_ACCOUNT_INVESTMENT = 15
    TABLE_ASSETS_INFO = 17

    @staticmethod
    def extract_cell_value(row, column_index):
        """Extract cell text value safely"""
        try:
            return (
                row.cells[column_index].text.strip()
                if column_index < len(row.cells)
                else ""
            )
        except Exception:
            return ""

    @staticmethod
    def find_checkbox_value(text):
        """Determine if a checkbox is checked"""
        return ClientProfileParser.CHECKBOX_CHECKED in text

    @staticmethod
    def get_marital_status(text) -> MaritalStatus:
        """Extract marital status from checkbox text"""
        for status in MaritalStatus:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {status.value}" in text:
                return status
        return None

    @staticmethod
    def get_gender(text) -> Gender:
        """Extract gender from checkbox text"""
        for gender in Gender:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {gender.value}" in text:
                return gender
        return None

    @staticmethod
    def get_wealth_range(text) -> WealthRange:
        """Extract wealth range from checkbox text"""
        for range in WealthRange:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {range.value}" in text:
                return range
        return None

    @staticmethod
    def get_income_range(text) -> IncomeRange:
        """Extract income range from checkbox text"""
        for range in IncomeRange:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {range.value}" in text:
                return range
        return None

    @staticmethod
    def get_risk_profile(text):
        """Extract risk profile from checkbox text"""
        for risk in RiskProfile:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {risk.value}" in text:
                return risk
        return None

    @staticmethod
    def extract_wealth_sources(text):
        """Extract wealth sources from checkbox text"""
        sources = []
        for source in WealthSource:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {source.value}" in text:
                sources.append(source.value)
        return sources

    @staticmethod
    def extract_assets(text):
        """Extract assets from checkbox text"""
        assets = {}
        for line in text.splitlines():
            if ClientProfileParser.CHECKBOX_CHECKED in line:
                line = line.replace(ClientProfileParser.CHECKBOX_CHECKED, "").strip()
                if line:
                    assets[line.split("EUR")[0].strip()] = line.split("EUR")[1].strip()
        return assets

    @staticmethod
    def get_mandate_type(text):
        """Extract mandate type from checkbox text"""
        for mandate_type in MandateType:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {mandate_type.value}" in text:
                return mandate_type
        return None

    @staticmethod
    def get_investment_experience(text):
        """Extract investment experience level from checkbox text"""
        for experience in InvestmentExperience:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {experience.value}" in text:
                return experience
        return None

    @staticmethod
    def get_investment_horizon(text):
        """Extract investment horizon from checkbox text"""
        for horizon in InvestmentHorizon:
            if f"{ClientProfileParser.CHECKBOX_CHECKED} {horizon.value}" in text:
                return horizon
        return None

    @staticmethod
    def get_transaction_frequency(text):
        """Extract transaction frequency from text"""
        return text

    @staticmethod
    def extract_preferred_markets(text):
        """Extract preferred markets from checkbox text"""
        markets = text.split(",")
        return [market.strip() for market in markets] if markets else []

    @staticmethod
    def parse_basic_info(table, client):
        """Parse basic client information from table"""
        for row in table.rows:
            row_label = ClientProfileParser.extract_cell_value(row, 0)
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            row_label = row_label.lower()

            if "last name" in row_label:
                client.last_name = row_value
            elif "first/ middle name" in row_label:
                client.first_name = row_value
            elif "address" in row_label:
                client.address = row_value
            elif "date of birth" in row_label:
                client.birth_date = row_value
            elif "nationality" in row_label:
                client.nationality = row_value
            elif "passport no/ unique id" in row_label:
                client.passport_id = row_value
            elif "id type" in row_label:
                client.id_type = row_value
            elif "id issue date" in row_label:
                client.id_issue_date = row_value
            elif "id expiry date" in row_label:
                client.id_expiry_date = row_value
            elif "gender" in row_label:
                client.gender = ClientProfileParser.get_gender(row_value)
            elif "country of domicile" in row_label:
                client.country_of_domicile = row_value

    @staticmethod
    def parse_contact_info(table, client):
        """Parse contact information from table"""
        for row in table.rows:
            row_value = ClientProfileParser.extract_cell_value(row, 2)
            if "Telephone" in row_value:
                client.contact_info.telephone = row_value.replace(
                    "Telephone", ""
                ).strip()
            elif "E-Mail" in row_value:
                client.contact_info.email = row_value.replace(
                    "E-Mail", ""
                ).strip()

    @staticmethod
    def parse_pep_status(table, client):
        """Parse politically exposed person status"""
        row_value = ClientProfileParser.extract_cell_value(table.rows[0], 2)
        client.personal_info.is_politically_exposed = (
            f"{ClientProfileParser.CHECKBOX_CHECKED} Yes" in row_value
        )

    @staticmethod
    def parse_marital_education(table, client):
        """Parse marital status and education information"""
        for row in table.rows:
            row_label = ClientProfileParser.extract_cell_value(row, 0).lower()
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            if "marital status" in row_label:
                client.personal_info.marital_status = (
                    ClientProfileParser.get_marital_status(row_value)
                )
            elif "highest education" in row_label:
                client.personal_info.highest_education = row_value
            elif "education history" in row_label:
                client.personal_info.education_history = row_value

    @staticmethod
    def parse_employment_part1(table, employment):
        """Parse first part of employment information"""
        for row in table.rows:
            row_label = ClientProfileParser.extract_cell_value(row, 0)
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            if "Current employment and function" in row_label:
                if "Employee" in row_value:
                    employment.current_status.status_type = (
                        EmploymentType.EMPLOYEE
                    )
                    # Extract the "Since" date
                    if "Since" in row_value:
                        employment.current_status.since = (
                            row_value.split("Since")[1].strip()
                        )
                elif "Name Employer" in row_value:
                    employment.employer = row_value.replace(
                        "Name Employer", ""
                    ).strip()
                elif "Position" in row_value:
                    # Extract position and possibly annual income
                    parts = (
                        row_value.replace("Position", "").strip().split("(")
                    )
                    employment.position = parts[0].strip()
                    if len(parts) > 1:
                        employment.annual_income = (
                            parts[1].replace(")", "").strip()
                        )

    @staticmethod
    def parse_employment_part2(table, employment):
        """Parse second part of employment information"""
        for row in table.rows:
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            if (
                "Currently not employed" in row_value
                and ClientProfileParser.find_checkbox_value(row_value)
            ):
                employment.current_status.status_type = (
                    EmploymentType.NOT_EMPLOYED
                )
                if "Since" in row_value:
                    since_value = row_value.split("Since")[1].strip()
                    if since_value:
                        employment.current_status.since = (
                            since_value
                        )

            elif "Previous Profession" in row_value:
                employment.previous_profession = row_value.replace(
                    "Previous Profession:", ""
                ).strip()

            elif (
                "Retired" in row_value
                and ClientProfileParser.find_checkbox_value(row_value)
            ):
                employment.current_status.status_type = (
                    EmploymentType.RETIRED
                )
                if "Since" in row_value:
                    since_value = row_value.split("Since")[1].strip()
                    if since_value:
                        employment.current_status.since = (
                            since_value
                        )

    @staticmethod
    def parse_wealth_info(table, client):
        """Parse wealth information"""
        for row in table.rows:
            row_label = ClientProfileParser.extract_cell_value(row, 0)
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            if "Total wealth estimated" in row_label:
                client.wealth_info.total_wealth_range = (
                    ClientProfileParser.get_wealth_range(row_value)
                )
            elif "Origin of wealth" in row_label:
                client.wealth_info.wealth_sources = (
                    ClientProfileParser.extract_wealth_sources(row_label)
                )
                if row_value:
                    client.wealth_info.source_info.append(row_value)
            elif "estimated assets" in row_label.lower():
                client.wealth_info.assets = (
                    ClientProfileParser.extract_assets(row_value)
                )

    @staticmethod
    def parse_income_info(table, client):
        """Parse income information"""
        for row in table.rows:
            row_label = ClientProfileParser.extract_cell_value(row, 0)
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            if "Estimated Total income" in row_label:
                client.income_info.total_income_range = (
                    ClientProfileParser.get_income_range(row_value)
                )
            if "Country of main source of income" in row_label:
                client.income_info.source_info = row_value

    @staticmethod
    def parse_account_investment(table, client):
        """Parse account details and investment preferences"""
        for row in table.rows:
            row_label = ClientProfileParser.extract_cell_value(row, 0)
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            if "Account Number" in row_label:
                client.account_details.account_number = row_value
            elif "Commercial Account" in row_label:
                client.account_details.is_commercial_account = (
                    f"{ClientProfileParser.CHECKBOX_CHECKED} Yes"
                    in row_value
                )
            elif "Investment Risk Profile" in row_label:
                client.account_details.risk_profile = (
                    ClientProfileParser.get_risk_profile(row_value)
                )
            elif "Type of Mandate" in row_label:
                client.account_details.investment_preferences.type_of_mandate = ClientProfileParser.get_mandate_type(
                    row_value
                )
            elif "Investment Experience" in row_label:
                client.account_details.investment_preferences.investment_experience = ClientProfileParser.get_investment_experience(
                    row_value
                )
            elif "Investment Horizon" in row_label:
                client.account_details.investment_preferences.investment_horizon = ClientProfileParser.get_investment_horizon(
                    row_value
                )
            elif "Expected Transactional Behavior" in row_label:
                client.account_details.investment_preferences.expected_transactional_behavior = ClientProfileParser.get_transaction_frequency(
                    row_value
                )
            elif "Preferred Markets" in row_label:
                client.account_details.investment_preferences.preferred_markets = ClientProfileParser.extract_preferred_markets(
                    row_value
                )

    @staticmethod
    def parse_assets_info(table, client):
        """Parse assets information"""
        for row in table.rows:
            row_label = ClientProfileParser.extract_cell_value(row, 0)
            row_value = ClientProfileParser.extract_cell_value(row, 2)

            if "Total Asset Under Management" in row_label:
                try:
                    client.account_details.total_assets = float(
                        row_value.replace(",", "")
                    )
                except ValueError:
                    client.account_details.total_assets = row_value
            elif "Asset Under Management to transfer" in row_label:
                try:
                    client.account_details.transfer_assets = float(
                        row_value.replace(",", "")
                    )
                except ValueError:
                    client.account_details.transfer_assets = row_value

    @staticmethod
    def parse(file_path: str) -> ClientProfile:
        """Parse a docx file and return a ClientProfile object"""
        client = ClientProfile()
        primary_employment = Employment()
        
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger("ClientProfileParser")

        try:
            logger.info(f"Parsing profile document: {file_path}")
            doc = docx.Document(file_path)

            # Parse tables based on their function
            for i, table in enumerate(doc.tables):
                if i == 0:  # Skip the "Client Information" header table
                    continue

                try:
                    # Parse each table based on its index
                    if i == ClientProfileParser.TABLE_BASIC_INFO:
                        ClientProfileParser.parse_basic_info(table, client)
                        
                    elif i == ClientProfileParser.TABLE_CONTACT_INFO:
                        ClientProfileParser.parse_contact_info(table, client)
                        
                    elif i == ClientProfileParser.TABLE_PEP_STATUS:
                        ClientProfileParser.parse_pep_status(table, client)
                        
                    elif i == ClientProfileParser.TABLE_MARITAL_EDUCATION:
                        ClientProfileParser.parse_marital_education(table, client)
                        
                    elif i == ClientProfileParser.TABLE_EMPLOYMENT_PART1:
                        ClientProfileParser.parse_employment_part1(table, primary_employment)
                        
                    elif i == ClientProfileParser.TABLE_EMPLOYMENT_PART2:
                        ClientProfileParser.parse_employment_part2(table, primary_employment)
                        
                        # Add the parsed employment to client profile
                        if (
                            primary_employment.employer
                            or primary_employment.position
                            or primary_employment.current_status.status_type
                        ):
                            client.employment.append(primary_employment)
                            
                    elif i == ClientProfileParser.TABLE_WEALTH_INFO:
                        ClientProfileParser.parse_wealth_info(table, client)
                        
                    elif i == ClientProfileParser.TABLE_INCOME_INFO:
                        ClientProfileParser.parse_income_info(table, client)
                        
                    elif i == ClientProfileParser.TABLE_ACCOUNT_INVESTMENT:
                        ClientProfileParser.parse_account_investment(table, client)
                        
                    elif i == ClientProfileParser.TABLE_ASSETS_INFO:
                        ClientProfileParser.parse_assets_info(table, client)
                        
                except Exception as table_error:
                    logger.error(f"Error parsing table {i}: {table_error}")
                    # Continue with next table instead of failing entirely
                    continue

            logger.info(f"Successfully parsed profile for {client.first_name} {client.last_name}")
            
        except Exception as e:
            logger.error(f"Error parsing {file_path}: {e}")

        return client


if __name__ == "__main__":
    # Set default paths
    default_input_path = "C:\\Users\\jekatrinaj\\swisshacks\\data\\level_5\\profile.docx"
    default_output_path = "C:\\Users\\jekatrinaj\\swisshacks\\data\\level_5\\profile_output.json"
    
    # Setup argument parser
    parser = argparse.ArgumentParser(description='Parse client profile document and convert to JSON')
    parser.add_argument('--input', '-i', 
                        default=default_input_path,
                        help='Path to the input profile DOCX file')
    parser.add_argument('--output', '-o', 
                        default=default_output_path,
                        help='Path to save the output JSON file')
    
    # Parse arguments
    args = parser.parse_args()
    input_path = args.input
    output_json_path = args.output

    client_profile = ClientProfileParser.parse(input_path)

    # Save JSON data to file
    json_data = client_profile.to_json(indent=2, ensure_ascii=False)

    # Save to file if path provided
    with open(output_json_path, "w", encoding="utf-8") as json_file:
        json_file.write(json_data)
    print(f"JSON data saved to {output_json_path}")
