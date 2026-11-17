from pathlib import Path
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parent


def train_and_save_model(data_path: Path = None, model_path: Path = None):
    """
    Trains a Random Forest classifier pipeline with OneHotEncoding
    on the churn dataset and serializes the pipeline to disk.
    """
    if data_path is None:
        data_path = BASE_DIR / "data" / "cleaned_churn.csv"
    if model_path is None:
        model_path = BASE_DIR / "models" / "churn_model.pkl"

    # If cleaned dataset does not exist, run clean_dataset first
    if not data_path.exists():
        from clean_data import clean_dataset
        print("Cleaned data not found. Running clean_dataset()...")
        clean_dataset()

    df = pd.read_csv(data_path)

    # Separate input features and target
    X = df.drop(columns=["Churn"])
    y = df["Churn"].map({"No": 0, "Yes": 1})

    # Identify categorical and numeric columns without deprecation warnings
    categorical_columns = X.select_dtypes(include=["object", "string", "category"]).columns
    numeric_columns = X.select_dtypes(include=["number"]).columns

    # Convert text categories into one-hot vectors
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_columns),
            ("numeric", "passthrough", numeric_columns),
        ]
    )

    # Create the ML pipeline
    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=200,
                    random_state=42,
                    class_weight="balanced",
                ),
            ),
        ]
    )

    # Split data: 80% training, 20% testing
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train the model
    print("Training churn prediction model...")
    model.fit(X_train, y_train)

    # Evaluate the model
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"\nModel Accuracy: {round(accuracy * 100, 2)}%")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # Save the trained model
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    print(f"\nModel saved successfully as {model_path}!")

    return model, accuracy


if __name__ == "__main__":
    train_and_save_model()
