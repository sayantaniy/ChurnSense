"""
Train script entrypoint for ChurnSense.
Runs the model training pipeline and outputs performance evaluation.
"""

from train_model import train_and_save_model

if __name__ == "__main__":
    train_and_save_model()
