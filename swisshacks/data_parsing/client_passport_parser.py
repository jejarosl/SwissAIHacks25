from pathlib import Path
from enum import Enum

from client_data.client_passport import ClientPassport
from data_parsing.client_parser import ParserClass

class PassportBackendType(Enum):
    OPENAI = "openai"
    EASY_OCR = "easyocr"
    TESSERACT = "tesseract"

class ClientPassportParser(ParserClass):
    def __init__(self, backend_type: PassportBackendType):
        self.backend_type = backend_type
        self.parser = None
        
        if backend_type == PassportBackendType.OPENAI:
            from data_parsing.parse_passport_openai import PassportParserOpenAI
            self.parser = PassportParserOpenAI()
        elif backend_type == PassportBackendType.EASY_OCR:
            from data_parsing.parse_passport_easyocr import PassportParserEasyOCR
            self.parser = PassportParserEasyOCR()
        elif backend_type == PassportBackendType.TESSERACT:
            raise NotImplementedError("Tesseract backend is not implemented yet.")
        else:
            raise ValueError(f"Unsupported backend type: {backend_type}")
        
        
    def parse(self, passport_file_path: Path) -> ClientPassport:
        """
        Parse a passport image (PNG) to extract structured data.
        
        Args:
            passport_file_path: Path to the passport image file
            
        Returns:
            Dictionary containing extracted passport information
        """
        if not self.parser:
            raise ValueError("Parser not initialized.")
        
        return self.parser.parse(passport_file_path)
    

        