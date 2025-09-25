from abc import ABC, abstractmethod
from pathlib import Path
from dataclasses import dataclass

class ParserClass(ABC):
    @abstractmethod
    def parse(self, path_to_file: Path) -> dataclass:
        pass
    