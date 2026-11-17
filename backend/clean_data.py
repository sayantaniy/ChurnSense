from pathlib import Path
import pandas as pd


def clean_dataset(input_path: Path = None, output_path: Path = None) -> pd.DataFrame:
    """
    Cleans the customer churn dataset by converting types,
    handling missing values, and preparing features for ML modeling.
    """
    base_dir = Path(__file__).resolve().parent
    if input_path is None:
        input_path = base_dir / "data" / "customer_churn.csv"
    if output_path is None:
        output_path = base_dir / "data" / "cleaned_churn.csv"

    if not input_path.exists():
        raise FileNotFoundError(f"Source dataset not found at {input_path}")

    # Locate and load the dataset
    df = pd.read_csv(input_path)

    # Convert TotalCharges from text to numbers
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

    # Check for missing values after conversion
    missing_count = df["TotalCharges"].isnull().sum()
    print(f"Missing TotalCharges values before drop: {missing_count}")

    # Remove rows containing missing values
    df_clean = df.dropna().copy()

    # Drop customerID for ML training data
    df_clean_ml = df_clean.drop(columns=["customerID"])

    # Ensure output directory exists and save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_clean_ml.to_csv(output_path, index=False)

    print(f"Cleaned dataset shape: {df_clean_ml.shape}")
    print(f"Cleaned dataset saved successfully to {output_path}")

    return df_clean_ml


if __name__ == "__main__":
    clean_dataset()
