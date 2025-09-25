from enum import Enum
from model.base_predictor import BasePredictor
from model.layered_model import LayeredModel
from model.rule_based_model import SimpleModel
from model.openai_based_model import OpenAIPredictor

class ValidationModelType(Enum):
    RULE_BASED = SimpleModel
    LAYERED = LayeredModel
    OPENAI = OpenAIPredictor

class DocumentValidationFactory:
    """
    Factory class for creating document validation models.
    """

    @staticmethod
    def create_model(model_type: ValidationModelType) -> BasePredictor:
        """
        Create a document validation model based on the specified type.

        Args:
            model_type (str): The type of model to create.

        Returns:
            DocumentValidationModel: An instance of the specified model type.
        """
        return model_type.value