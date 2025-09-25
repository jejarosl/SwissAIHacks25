from dataclasses import dataclass, field
from dataclasses_json import dataclass_json
from enum import Enum

class GenderEnum(Enum):
    MALE = "Male"
    FEMALE = "Female"
    
    def convert_str_to_enum(value: str) -> 'GenderEnum':
        """Convert string to GenderEnum."""
        if value.lower() in ("m", "male"):
            return GenderEnum.MALE
        elif value.lower() in ("f", "female"):
            return GenderEnum.FEMALE
        else:
            raise ValueError(f"Invalid value for GenderEnum: {value!r}")

@dataclass_json
@dataclass
class ClientPassport:
    given_name: str
    surname: str
    sex: GenderEnum
    birth_date: str
    citizenship: str
    issuing_country: str
    country_code: str
    number: str
    issue_date: str
    expiry_date: str
    signature: bool
    passport_mrz: list = field(default_factory=list)
    version: str = "2.0"
    
    def validate_fields(self):       
        for name, dc_field in self.__dataclass_fields__.items():
            if not isinstance(self.__getattribute__(name), dc_field.type):
                raise TypeError(f"Field {name} is not of type {dc_field.type}")
        
    def is_valid(self) -> bool:
        try:
            self.validate_fields()
            return True
        except Exception as e:
            print(f"Validation error: {e}")
            return False
        