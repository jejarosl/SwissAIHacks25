from abc import ABC, abstractmethod
from client_data.client_data import ClientData

class BasePredictor(ABC):
    @abstractmethod
    def predict(self, client: ClientData) -> bool:
        raise NotImplementedError
