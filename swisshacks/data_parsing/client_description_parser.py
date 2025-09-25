import re
import os
from pathlib import Path
import argparse  # Add import for argument parsing

from client_data.client_description import ClientDescription
from data_parsing.client_parser import ParserClass

class ClientDescriptionParser(ParserClass):
    """Parser for client description text files"""

    @staticmethod
    def parse(text_path: Path) -> ClientDescription:
        """
        Parse the client description text file and return a ClientDescription object
        
        Args:
            text_path (str): Path to the description text file
            
        Returns:
            ClientDescription: Populated client description object
        """
        try:
            # Check if file exists
            if not os.path.exists(text_path):
                raise FileNotFoundError(f"File not found: {text_path}")
            
            # Read the text file
            with open(text_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Create ClientDescription object
            client_description = ClientDescription()
            
            # Define sections to extract (with the original text format)
            section_mappings = {
                "Summary Note": "summary_note",
                "Family Background": "family_background",
                "Education Background": "education_background",
                "Occupation History": "occupation_history",
                "Wealth Summary": "wealth_summary",
                "Client Summary": "client_summary"
            }
            
            sections = list(section_mappings.keys())
            
            # Extract content between sections and directly populate the ClientDescription object
            for i, section in enumerate(sections):
                # Create pattern to match the section and its content
                pattern = f"{section}: ?(.*?)"
                
                # If this is the last section, match until the end of file
                if i == len(sections) - 1:
                    pattern += "(?:\Z)"
                else:
                    # Otherwise match until the next section
                    pattern += f"(?={sections[i+1]}: )"
                
                # Find the section in the text
                matches = re.search(pattern, content, re.DOTALL)
                if matches:
                    # Extract and clean the section content
                    section_content = matches.group(1).strip()
                    
                    # Process the section content (here just remove extra whitespace)
                    section_content = re.sub(r'\n+', '\n', section_content)
                    
                    # Directly set the attribute on the ClientDescription object
                    setattr(client_description, section_mappings[section], section_content)
            
            return client_description
        
        except Exception as e:
            raise ValueError(f"Error parsing text file: {str(e)}")


if __name__ == "__main__":
    # Set default paths
    default_input_path = "C:\\Users\\jekatrinaj\\swisshacks\\data\\level_5\\description.txt"
    default_output_path = "C:\\Users\\jekatrinaj\\swisshacks\\data\\level_5\\description.json"
    
    # Setup argument parser
    parser = argparse.ArgumentParser(description='Parse client description text and convert to JSON')
    parser.add_argument('--input', '-i', 
                        default=default_input_path,
                        help='Path to the input description text file')
    parser.add_argument('--output', '-o', 
                        default=default_output_path,
                        help='Path to save the output JSON file')
    
    # Parse arguments
    args = parser.parse_args()
    input_path = args.input
    output_json_path = args.output

    client_description = ClientDescriptionParser.parse(input_path)

    # Save JSON data to file
    json_data = client_description.to_json(indent=2, ensure_ascii=False)

    # Save to file if path provided
    with open(output_json_path, "w", encoding="utf-8") as json_file:
        json_file.write(json_data)
    print(f"JSON data saved to {output_json_path}")