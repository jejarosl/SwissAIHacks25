#!/usr/bin/env python3
"""
Quick test runner for the Task Extraction Analysis

This script runs a minimal test to verify the analysis pipeline works
before running on the full dataset.
"""

import os
import sys
from pathlib import Path

LIMIT = 50

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Loaded environment variables from .env file")
except ImportError:
    print("ℹ️  python-dotenv not available, using system environment variables only")
except Exception as e:
    print(f"⚠️  Could not load .env file: {e}")

def check_environment():
    """Check if required environment variables are set"""
    print("🔍 Checking environment setup...")
    
    required_vars = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_API_ENDPOINT']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {missing_vars}")
        print("Please set these variables before running the test.")
        return False
    
    optional_vars = ['HUGGINGFACE_TOKEN', 'HUGGINGFACE_ENDPOINT_URL']
    available_optional = [var for var in optional_vars if os.getenv(var)]
    
    print(f"✅ Required variables: {', '.join(required_vars)}")
    if available_optional:
        print(f"✅ Optional variables: {', '.join(available_optional)}")
    else:
        print("⚠️  No optional HuggingFace variables (Apertus model will be skipped)")
    
    return True

def check_data_directory():
    """Check if data directory exists"""
    print("\n📁 Checking data directory...")
    
    data_dir = Path("data/ubs_synthetic_call_transcripts_dataset")
    
    if not data_dir.exists():
        print(f"❌ Data directory not found: {data_dir}")
        print("Please ensure the dataset is extracted to the correct location.")
        return False
    
    subdirs = ['train', 'test', 'validation']
    for subdir in subdirs:
        subdir_path = data_dir / subdir
        if not subdir_path.exists():
            print(f"❌ Missing subdirectory: {subdir_path}")
            return False
        
        # Count files
        json_files = len(list(subdir_path.glob("*.json")))
        txt_files = len(list(subdir_path.glob("*.txt")))
        print(f"✅ {subdir}: {json_files} JSON files, {txt_files} TXT files")
    
    return True

def run_quick_test():
    """Run a quick test with a small subset"""
    print("\n🚀 Running quick test...")
    
    try:
        # Import our analysis module
        from task_extraction_analysis import TaskExtractionAnalysis
        
        # Initialize analysis
        analysis = TaskExtractionAnalysis()
        
        # Run with small subset for testing
        results = analysis.run_complete_analysis(
            use_training_context=True,
            test_subset_size=LIMIT,  # Only 5 conversations for quick test
            output_dir="test_results"
        )
        
        print("\n✅ Quick test completed successfully!")
        
        if results['scores']:
            print("📊 Test Results:")
            for model, score in results['scores'].items():
                print(f"   {model}: {score:.3f}")
        
        print("\n📂 Test outputs saved to: test_results/")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure task_extraction_analysis.py is in the current directory.")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main test runner"""
    print("SwissAIHacks25 - Task Extraction Analysis Test Runner")
    print("=" * 55)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Check data
    if not check_data_directory():
        sys.exit(1)
    
    # Run quick test
    if not run_quick_test():
        sys.exit(1)
    
    print("\n🎉 All tests passed! You can now run the full analysis:")
    print("   python task_extraction_analysis.py")

if __name__ == "__main__":
    main()