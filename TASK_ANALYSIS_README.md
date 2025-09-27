# SwissAIHacks25 Task Extraction Analysis

## Overview

This script performs end-to-end analysis of GPT-4o and Apertus models for extracting actionable tasks from bank client conversation transcripts.

## Features

- ✅ **Data Loading**: Automatically loads UBS synthetic call transcripts dataset
- 🎯 **Context Extraction**: Identifies representative training examples for few-shot learning
- 🤖 **Dual Model Support**: Tests both GPT-4o (Azure OpenAI) and Apertus (Hugging Face) models
- 📊 **Comprehensive Evaluation**: Uses provided scoring function with weighted penalties
- 📈 **Visualizations**: Creates performance dashboards and analysis charts
- 📝 **Detailed Reports**: Generates comprehensive analysis reports

## Quick Start

### 1. Install Dependencies

```bash
pip install -r analysis_requirements.txt
```

### 2. Set Environment Variables

**Option A: Using .env file (Recommended)**
Create a `.env` file in the project root:
```env
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_API_ENDPOINT=your_azure_openai_endpoint
HUGGINGFACE_TOKEN=your_hf_token
HUGGINGFACE_ENDPOINT_URL=your_hf_endpoint
```

**Option B: System Environment Variables**
```bash
export AZURE_OPENAI_API_KEY="your_azure_openai_key"
export AZURE_OPENAI_API_ENDPOINT="your_azure_openai_endpoint"
export HUGGINGFACE_TOKEN="your_hf_token"
export HUGGINGFACE_ENDPOINT_URL="your_hf_endpoint"
```

### 3. Run Analysis

```bash
python task_extraction_analysis.py
```

## Output

The script creates an `analysis_results/` directory containing:

- 📊 `performance_dashboard.png` - Visual performance comparison
- 📝 `analysis_report.txt` - Detailed text report
- 📋 `analysis_results.json` - Machine-readable results

## Script Structure

### Core Components

1. **TaskPredictor Classes**
   - `GPT4oTaskPredictor`: Azure OpenAI GPT-4o implementation
   - `ApertusTaskPredictor`: Hugging Face model implementation

2. **DatasetLoader**
   - Loads train/test/validation splits
   - Handles JSON task files and TXT conversation files

3. **ContextExtractor**
   - Selects representative training examples
   - Creates few-shot learning context strings
   - Covers all 8 task types + no-task scenarios

4. **ModelEvaluator**
   - Implements challenge scoring function
   - Handles duplicate removal and validation
   - Weighted scoring: FN penalty = 2.0, FP penalty = 1.0

5. **AnalysisVisualizer**
   - Creates performance comparison charts
   - Shows task distribution and prediction volumes
   - Generates comprehensive dashboards

### Task Types

The script handles these 8 task types:
- `plan_contact`
- `schedule_meeting`
- `update_contact_info_non_postal`
- `update_contact_info_postal_address`
- `update_kyc_activity`
- `update_kyc_origin_of_assets`
- `update_kyc_purpose_of_businessrelation`
- `update_kyc_total_assets`

## Configuration Options

You can customize the analysis by modifying the `main()` function:

```python
results = analysis.run_complete_analysis(
    use_training_context=True,        # Use few-shot examples
    test_subset_size=None,           # Use full test set (or set to 100 for testing)
    output_dir="analysis_results"    # Output directory
)
```

## Error Handling

- ✅ Graceful handling of missing API credentials
- ✅ Automatic fallback if models fail to initialize
- ✅ Robust JSON parsing with error recovery
- ✅ Comprehensive logging for debugging

## Sample Output

```
🚀 SwissAIHacks25 Task Extraction Analysis
Loading dataset splits...
Loaded - Train: 724 conversations, Test: 242 conversations, Validation: 242 conversations
Extracting representative training examples...
Selected 10 representative examples
Prepared 242 test conversations
Running GPT-4o predictions...
GPT-4o Score: 0.824
Running Apertus predictions...
Apertus Score: 0.657
Creating performance dashboard...
✅ Analysis complete! Results saved to analysis_results
🏆 Best performing model: GPT-4o (0.824)
```

## Troubleshooting

### Missing API Keys
Make sure environment variables are set:
```bash
echo $AZURE_OPENAI_API_KEY
echo $AZURE_OPENAI_API_ENDPOINT
```

### Dataset Not Found
Ensure the data directory structure:
```
data/ubs_synthetic_call_transcripts_dataset/
├── train/
├── test/
└── validation/
```

### Import Errors
Install all dependencies:
```bash
pip install -r analysis_requirements.txt
```

## Performance

- **Full test set**: ~242 conversations, takes ~10-15 minutes
- **Test subset**: Use `test_subset_size=50` for faster testing
- **Memory usage**: ~500MB for full analysis
- **Output size**: ~2MB (includes visualizations)

## License

See main project LICENSE file.