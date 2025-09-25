from dataclasses import dataclass, field
from dataclasses_json import dataclass_json
from typing import Optional
from datetime import datetime


@dataclass_json
@dataclass
class ClientDescription:
    # Client background information
    summary_note: Optional[str] = None
    family_background: Optional[str] = None
    education_background: Optional[str] = None
    occupation_history: Optional[str] = None
    wealth_summary: Optional[str] = None
    client_summary: Optional[str] = None
    
    # Metadata
    parsed_date: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def validate_fields(self) -> None:
        """
        Validates that all fields are not empty.
        Raises ValueError if validation fails.
        """
        missing_fields = []
        
        # Get all field names from the dataclass
        all_fields = self.__dataclass_fields__.keys()
        
        # Check each field except for metadata
        for field_name in all_fields:
            # Skip metadata fields
            if field_name == 'parsed_date':
                continue
                
            # Check if the field is empty
            value = getattr(self, field_name)
            if value is None or value == "":
                missing_fields.append(field_name)
        
        if missing_fields:
            raise ValueError(f"Required fields cannot be empty: {', '.join(missing_fields)}")
            
    def is_valid(self) -> bool:
        """
        Check if all required fields are filled.
        Returns True if valid, False otherwise.
        """
        try:
            self.validate_fields()
            return True
        except ValueError:
            return False