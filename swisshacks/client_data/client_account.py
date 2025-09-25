from dataclasses import dataclass, field
from dataclasses_json import dataclass_json
from typing import Optional, Set
from datetime import datetime


@dataclass_json
@dataclass
class SignatureFields:
    specimen_signature: bool = False
    _signature_fields: bool = False


@dataclass_json
@dataclass
class ClientAccount:
    # Account holder information
    account_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    account_holder_surname: Optional[str] = None
    passport_number: Optional[str] = None
    
    # Currency preferences
    chf: bool = False
    eur: bool = False
    usd: bool = False
    other_ccy: Optional[str] = None
    
    # Address information
    building_number: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    street_name: Optional[str] = None
    
    # Contact information
    name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    
    # Signature information
    _signature_fields: SignatureFields = field(default_factory=SignatureFields)
    
    # Metadata
    parsed_date: str = field(default_factory=lambda: datetime.now().isoformat())
    
    # Define which fields are optional - everything else is required
    _optional_fields: Set[str] = field(default_factory=lambda: {
        'other_ccy',
        '_signature_fields',
        'parsed_date'
    })
    
    def validate_fields(self) -> None:
        """
        Validates that all non-optional fields are not empty.
        Raises ValueError if validation fails.
        """
        missing_fields = []
        
        # Get all field names from the dataclass
        all_fields = self.__dataclass_fields__.keys()
        
        # Check each field that is not in optional_fields and not a boolean field
        for field_name in all_fields:
            # Skip metadata/internal fields that start with underscore
            if field_name.startswith('_') and field_name != '_signature_fields':
                continue
                
            # Skip optional fields
            if field_name in self._optional_fields:
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