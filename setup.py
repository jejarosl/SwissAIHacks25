from setuptools import setup, find_packages

setup(
    name="swisshacks",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "requests",
        "python-dotenv",
        "boto3",
        "PyPDF2",
        "python-docx",
        "dataclasses-json",
        "pillow",
        "easyocr",
        "openai",
    ],
    entry_points={
        'console_scripts': [
            'swisshacks-play=swisshacks.play_game:run_game',
            'swisshacks-continuous=swisshacks.play_game:run_game_continuously',
            'swisshacks-evaluate=swisshacks.evaluate_train:eval_on_trainset',
            'swisshacks-create-test=swisshacks.create_test_data:main',
            'swisshacks-validate=swisshacks.test_validations:main',
        ],
    },
    author="3plus1",
    description="SwissHacks package for Julius Baer hackathon",
    python_requires=">=3.8",
)