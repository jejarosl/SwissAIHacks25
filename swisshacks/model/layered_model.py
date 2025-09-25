from model.rule_based_model import SimpleModel
from model.base_predictor import BasePredictor
from model.openai_based_model import OpenAIPredictor
from client_data.client_data import ClientData


class LayeredModel(BasePredictor):
    """
    A layered model that combines multiple models to make predictions.
    """

    def __init__(self, *args, **kwargs):
        self.rule_based_model = SimpleModel()
        self.language_model = OpenAIPredictor(*args, **kwargs)

    def predict(self, client: ClientData) -> bool:
        """
        Predict if the client is a money launderer or not.
        """
        # First, use the rule-based model
        rule_based_prediction = self.rule_based_model.predict(client)

        # If the rule-based model is uncertain, use the language model
        if rule_based_prediction is False:
            return rule_based_prediction

        language_model_prediction = self.language_model.predict(client)
        return language_model_prediction


