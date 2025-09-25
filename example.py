#!/usr/bin/env python3
"""Example script showing how to use the swisshacks package."""

from swisshacks.play_game import run_game, run_game_continuously
from swisshacks.evaluate_train import eval_on_trainset

def main():
    """Main entry point for the example script."""
    print("SwissHacks Package Demo")
    print("1. Run game once")
    print("2. Run game continuously")
    print("3. Evaluate on training set")
    
    choice = input("Enter your choice (1-3): ")
    
    if choice == "1":
        run_game()
    elif choice == "2":
        run_game_continuously()
    elif choice == "3":
        eval_on_trainset()
    else:
        print("Invalid choice. Exiting.")

if __name__ == "__main__":
    main()