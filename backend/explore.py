
import pandas as pd

# Load the customer dataset
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
df = pd.read_csv(BASE_DIR / "data" / "customer_churn.csv")

# Display the first 5 rows
print("\n--- First 5 Customers ---")
print(df.head())

# Display dataset dimensions
print("\n--- Dataset Shape ---")
print(df.shape)

# Display column names
print("\n--- Column Names ---")
print(df.columns.tolist())

# Display dataset information
print("\n--- Dataset Information ---")
print(df.info())

# Check missing values
print("\n--- Missing Values ---")
print(df.isnull().sum())

# Check churn distribution
print("\n--- Churn Distribution ---")
print(df["Churn"].value_counts())
