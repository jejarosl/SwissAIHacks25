from pathlib import Path

import trainset
from data_parsing.client_profile_parser import ClientProfileParser
from data_parsing.client_account_parser import ClientAccountParser
from data_parsing.client_description_parser import ClientDescriptionParser
from data_parsing.client_passport_parser import ClientPassportParser, PassportBackendType
from client_data.client_data import ClientData

from model.document_validation_model import DocumentValidationFactory, ValidationModelType


class TestStatistics:
    def __init__(self):
        self.false_positive: int = 0
        self.false_negative: int = 0
        self.true_positive: int = 0
        self.true_negative: int = 0

    @property
    def total_correct_predictions(self):
        return self.true_positive + self.true_negative

    @property
    def total_incorrect_predictions(self):
        return self.false_positive + self.false_negative

    @property
    def total_samples(self):
        return self.total_correct_predictions + self.total_incorrect_predictions

    @property
    def accuracy(self):
        if self.total_samples == 0:
            return 0
        return (self.total_correct_predictions) / self.total_samples

    def add_measurement(self, prediction: bool, ground_truth: bool):
        if prediction is True:
            if ground_truth is True:
                self.true_positive += 1
            else:
                self.false_positive += 1
        else:
            if ground_truth is True:
                self.false_negative += 1
            else:
                self.true_negative += 1

    def get_confusion_matrix_dict(self) -> dict:
        return {
            "TP": self.true_positive,
            "TN": self.true_negative,
            "FP": self.false_positive,
            "FN": self.false_negative,
        }

    def print_confusion_matrix(self):
        matrix = self.get_confusion_matrix_dict()

        # Create ASCII table for confusion matrix with proper axes
        print("\nConfusion Matrix:")
        print("+" + "-" * 31 + "+")
        print("|" + " " * 10 + "|" + " Predicted ".center(20) + "|")
        print("|" + " " * 10 + "+" + "-" * 9 + "+" + "-" * 10 + "|")
        print("|" + " " * 10 + "|" + "Positive".center(9) + "|" + "Negative".center(10) + "|")
        print("+" + "-" * 10 + "+" + "-" * 9 + "+" + "-" * 10 + "+")
        print("|" + "Positive".center(10) + "|" + f"TP: {matrix['TP']}".center(9) + "|" + f"FN: {matrix['FN']}".center(10) + "|")
        print("|" + " Ground ".center(10) + "|" + " " * 9 + "|" + " " * 10 + "|")
        print("|" + " Truth ".center(10) + "+" + "-" * 9 + "+" + "-" * 10 + "+")
        print("|" + "Negative".center(10) + "|" + f"FP: {matrix['FP']}".center(9) + "|" + f"TN: {matrix['TN']}".center(10) + "|")
        print("+" + "-" * 10 + "+" + "-" * 9 + "+" + "-" * 10 + "+")

    def __str__(self):
        return f"Total: {self.total_samples}, Correct: {self.total_correct_predictions}, Incorrect: {self.total_incorrect_predictions}, Accuracy: {self.accuracy:.2f}, TP: {self.true_positive}, TN: {self.true_negative}, FP: {self.false_positive}, FN: {self.false_negative}"

def eval_on_trainset():
    trainiter = trainset.TrainIterator()
    model = DocumentValidationFactory.create_model(ValidationModelType.RULE_BASED)()
    stats = TestStatistics()
    passport_parser = ClientPassportParser(PassportBackendType.OPENAI)

    try:
        for path in trainiter:
            input_dir = Path(path)
            print(input_dir)
            identifier = path.split('/')[-1]

            account = ClientAccountParser.parse(str(input_dir / "account.pdf"))
            profile = ClientProfileParser.parse(input_dir / "profile.docx")
            description = ClientDescriptionParser.parse(input_dir / "description.txt")
            passport = passport_parser.parse(input_dir / "passport.png")

            cd = ClientData(identifier, account, description, profile, passport)
            prediction = model.predict(cd)
            gt = bool(int((path.split('/')[-3][-1])))

            stats.add_measurement(bool(prediction), bool(gt))

            print(f"Prediction: {prediction}, GT: {gt}, Status: {gt == prediction}")

            trainiter.predict(prediction)
            print(trainiter, input_dir)
            print("----------")

            if stats.total_samples % 50 == 0:
                print(stats)
    except KeyboardInterrupt:
        print("User interrupted the run")
    finally:
        print("Final Statistics:")
        print(stats)
        stats.print_confusion_matrix()


if __name__ == "__main__":
    eval_on_trainset()
