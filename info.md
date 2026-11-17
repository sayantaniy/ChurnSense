# ChurnSense: Project and Backend Guide

This guide is written as a beginner-friendly explanation of what the project does and how its backend works. It is also a presentation cheat sheet.

## The project in one minute

ChurnSense is a customer analytics demo. It uses customer account and service details to estimate whether a customer may stop using a service (**churn**), estimates their future revenue value (**Customer Lifetime Value, or LTV**), and provides summaries that help a business decide whom to contact.

The backend is a Python API built with FastAPI. It loads customer data from CSV files, loads or trains a scikit-learn model, and gives the frontend predictions and analytics as JSON over HTTP. The deployed API is at `https://churnsense-f9l9.onrender.com`.

**A simple way to say it:** “I took customer subscription data, cleaned it, trained a Random Forest model to estimate churn risk, and built an API that combines those predictions with an LTV estimate and practical retention suggestions.”

## How a request moves through the system

1. The backend starts and loads the saved model from `backend/models/churn_model.pkl` (or its local compatible copy).
2. It reads the customer CSV and calculates churn probabilities for the customers in it.
3. It turns those probabilities into risk categories, estimates LTV, and precomputes dashboard summaries. These results are kept in memory while the API runs.
4. The frontend calls API endpoints. For an individual prediction, the backend validates the submitted profile, formats it as model features, runs the model, and returns a JSON result.

The main backend entry point is `backend/main.py`. The model-training code is in `backend/train_model.py`, data cleaning is in `backend/clean_data.py`, and LTV calculations are in `backend/ltv.py`.

## The data

The bundled CSV is based on customer subscription records. It contains **7,043 customer rows** and fields such as:

- Customer and household details: gender, senior-citizen status, partner, and dependents.
- Account details: tenure, contract type, paperless billing, and payment method.
- Services: phone, internet, security, backup, device protection, support, and streaming.
- Charges: monthly charges and total charges.
- The outcome to learn: `Churn` (`Yes` or `No`).

`customerID` identifies a record, but it is removed from the model-training data because it is an identifier, not a useful customer behavior feature. The API still uses the ID for customer-directory lookups.

### Cleaning the data

`backend/clean_data.py` performs these steps:

1. Reads `backend/data/customer_churn.csv`.
2. Converts `TotalCharges` from text to a number. Values that cannot be converted become missing.
3. Drops rows with missing values.
4. Removes `customerID` from the cleaned modeling CSV.
5. Writes the result to `backend/data/cleaned_churn.csv`.

The cleaned CSV has **7,032 customer rows**. This cleanup drops 11 rows with missing/unparseable `TotalCharges`; it does not fill those values in.

`backend/explore.py` is a small data-inspection script. It prints sample rows, column names, data shape, missing-value counts, and the number of customers in each churn class.

## The machine-learning model

### What the model predicts

The model estimates the probability of churn from 19 customer/account features. During training, `Churn` is converted into a numeric target: `No` becomes `0` and `Yes` becomes `1`.

### Algorithm: Random Forest classifier

The project uses scikit-learn's `RandomForestClassifier`. A Random Forest trains many decision trees on variations of the training data and combines their votes. A tree makes a series of feature-based decisions; combining many trees usually gives a more stable prediction than relying on one tree.

The configured model has:

- **200 trees** (`n_estimators=200`).
- A fixed random seed of **42**, so the split and training are reproducible.
- `class_weight="balanced"`, which gives extra weight to the less common class during training. This helps address the imbalance between customers who churn and those who do not.

### Turning categories into model inputs

Many inputs are words, such as `Contract = "Month-to-month"` or `InternetService = "Fiber optic"`. The training pipeline uses a `ColumnTransformer`:

- `OneHotEncoder` turns each categorical value into numeric indicator columns. `handle_unknown="ignore"` means an unfamiliar category at prediction time will not crash the pipeline.
- Numeric columns pass through unchanged.

These preprocessing steps and the classifier are joined in one scikit-learn `Pipeline`. The API can therefore send the original, readable feature columns to the saved pipeline; it applies the same encoding before making a prediction.

### Training and evaluation

`backend/train_model.py`:

1. Reads the cleaned CSV (and runs the cleaning script if the cleaned file is missing).
2. Separates the target (`Churn`) from the input features.
3. Splits the rows into **80% training** and **20% testing**, with stratification so the churn/no-churn proportions are represented in both sets.
4. Fits the pipeline on the training data.
5. Evaluates predictions on the held-out test split using accuracy and a classification report (precision, recall, and F1-score by class).
6. Saves the trained pipeline as a joblib file at `backend/models/churn_model.pkl`.

`backend/train.py` is a short command-line entry point that calls this training function.

The test split is a basic evaluation on this dataset, not proof of performance on every future customer population. The code prints the measured accuracy and report when training; the documentation does not claim a particular score.

### Model loading at API startup

At startup, `main.py` first tries `backend/models/churn_model.local.pkl`, then `backend/models/churn_model.pkl`. If a saved model cannot be loaded because of a package/version incompatibility, the backend retrains from the bundled cleaned data and saves a compatible local model. This keeps the API usable when the included serialized model was created with different package versions.

## Churn prediction, risk labels, and explanations

The single-customer endpoint sends the customer's fields through the saved pipeline. It returns:

- A model class prediction (`Yes` or `No`).
- Churn probability as both a percentage and a decimal.
- A risk label based on probability: **High** at 65% or above, **Medium** at 30% to below 65%, otherwise **Low**.
- Estimated LTV, an LTV segment, up to three risk-factor descriptions, and a suggested retention action.

The class prediction and risk label are related but are not the same rule. Scikit-learn's classifier supplies the class prediction, while the API applies its own 30% and 65% cutoffs to assign the risk label.

The displayed risk factors are **rule-based explanations**, not feature importance scores or SHAP explanations from the Random Forest. Examples include a month-to-month contract, short tenure, high monthly charges, electronic-check payments, or fiber service without support/security. The recommended retention text is also selected by business rules based on risk, contract, and LTV segment; the model does not generate that text.

## LTV calculation

LTV means an estimate of the customer's billed value plus possible future revenue over a chosen period. This project uses a straightforward **36-month projection**, not a separately trained LTV machine-learning model:

```text
remaining months = max(36 - tenure, 0)
future revenue = monthly charges × remaining months
projected LTV = historical total charges + future revenue
```

For churn-adjusted estimates, future revenue is multiplied by a retention weight based on `1 - churn_probability`. The weight has a floor of 0.15 so the estimate does not drop all projected revenue to zero. Historical charges are added as-is.

The churn-prediction flow and startup analytics pass the model's churn probability into this calculation. The dedicated LTV endpoint does not receive or calculate a churn probability, so it returns the unadjusted projection.

LTV segments are rule-based:

- **At-Risk** if churn probability is at least 65%.
- Otherwise **VIP** for LTV of $4,000 or more.
- Otherwise **Growth** for LTV of $2,000 to below $4,000.
- Otherwise **Core**.

The dedicated LTV endpoint returns a breakdown including historical billed amount, monthly run rate, tenure, projection period, estimated LTV, and segment.

## API endpoints

The interactive API reference is available at `https://churnsense-f9l9.onrender.com/docs`. When running the backend locally, it is at `http://127.0.0.1:8000/docs`.

| Endpoint | What it does |
|---|---|
| `GET /` | Basic service status and docs location. |
| `GET /api/v1/health` | Initializes if needed and reports service/model status and cached-customer count. |
| `POST /api/v1/predict/churn` | Predicts churn for one customer and returns probability, risk label, LTV, factors, and action. |
| `POST /api/v1/predict/ltv` | Returns an LTV projection and breakdown. |
| `POST /api/v1/predict/analyze` | Returns the combined single-customer churn analysis. |
| `GET /api/v1/metrics/summary` | Returns customer count, actual churn rate, average estimated LTV, and revenue at risk. |
| `GET /api/v1/metrics/churn-distribution` | Counts customers in ten predicted-probability bands from 0–10% through 90–100%. |
| `GET /api/v1/metrics/risk-distribution` | Counts customers by Low, Medium, and High risk. |
| `GET /api/v1/metrics/contract-churn` | Compares actual churn rates by contract type. |
| `GET /api/v1/metrics/ltv-cohorts` | Groups customers by tenure and summarizes their estimated LTV and risk. |
| `GET /api/v1/metrics/ltv-trends` | Returns the trend series currently configured in the code. |
| `GET /api/v1/customers` | Lists customers, with optional search, risk/contract filters, sorting, and pagination. |
| `GET /api/v1/customers/{customer_id}` | Looks up one customer by CSV customer ID. |
| `POST /api/v1/retention-action` | Returns a success-shaped response for a suggested action; it does not connect to a real messaging or CRM system. |

The request model in `main.py` accepts frontend-style camelCase names such as `tenureMonths` and `monthlyCharges`, as well as model/data-style field names. It supplies defaults for omitted values. If `TotalCharges` is omitted, it estimates it as monthly charges multiplied by at least one month of tenure.

## Dashboard calculations and important demo limitations

Most customer-level churn probabilities and risk/LTV distributions are calculated from the bundled CSV and model when the backend starts. The actual overall churn rate and contract churn comparisons use the `Churn` values in that CSV.

Some outputs are illustrative rather than live business measurements:

- The month-to-month percentage changes in the summary are fixed values in the code, not comparisons against stored historical periods.
- The LTV trend series is a fixed example series.
- The prediction response's `confidence` field is a fixed `92.5`, not calculated from the model. Use the churn probability as the model output instead.
- Customer names, companies, and emails shown in directory responses are presentation personas assigned to rows. Support-ticket counts and “last activity” are also simulated. They are not fields from the CSV.
- The retention-action endpoint does not actually dispatch or save an action.

These are useful to mention if asked whether the dashboard is connected to a live customer-management system: it is a working local analytics demo backed by bundled data, not a live CRM integration.

## Running it locally

The browser calls a same-origin Next.js API proxy. The Next.js server forwards requests to `https://churnsense-f9l9.onrender.com` by default, using the server-only `API_URL` environment variable if it is set. This lets the app work from a phone, tablet, or computer without exposing the backend URL as a browser environment variable.

From the project directory, create and activate a Python environment, install backend dependencies, and start FastAPI:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The local API is at `http://127.0.0.1:8000`; its interactive docs are at `http://127.0.0.1:8000/docs`. The deployed API is at `https://churnsense-f9l9.onrender.com`, with docs at `https://churnsense-f9l9.onrender.com/docs`. To retrain explicitly, run `python train.py` from `backend/`. On Windows, use `.venv\Scripts\activate` to activate the environment.

To make the frontend server proxy to a locally running backend instead of the deployed one, create `frontend/.env.local` with `API_URL=http://127.0.0.1:8000`, then restart the frontend. `API_URL` is read only by the Next.js server, not sent to browsers. The proxy allows up to 90 seconds for a backend response to accommodate a sleeping hosted service starting up.

The deployed frontend is `https://churnsense1.vercel.app`. In Vercel, set the server-side environment variable `API_URL=https://churnsense-f9l9.onrender.com` and redeploy. The frontend proxy makes same-origin requests, so the browser does not need direct CORS access to the backend. If an external browser-based app calls the backend directly, configure that app's exact origin in the backend's comma-separated `CHURNSENSE_ALLOWED_ORIGINS` environment variable.

The backend dependencies include FastAPI and Uvicorn for the API, Pydantic for request validation, pandas/NumPy for data handling, scikit-learn for preprocessing and the model, and joblib for saving/loading it.

## Tests

`backend/test_api.py` uses FastAPI's `TestClient` to exercise health, churn and LTV predictions, dashboard metrics, customer listing/detail, and the retention-action response. It contains 11 API checks. To run it from `backend/`, use:

```bash
python test_api.py
```

## Short presentation outline

1. **Problem:** Businesses want to identify customers likely to leave before they do.
2. **Data:** Each row describes a customer, their subscription/services/charges, and whether they churned.
3. **Preparation:** Convert charges to numbers, remove unusable rows and the ID column, then separate features from the churn label.
4. **ML:** Encode text categories, pass numeric values through, and train a class-balanced 200-tree Random Forest using an 80/20 stratified split.
5. **Backend:** FastAPI loads the model and exposes endpoints for predictions, LTV, metrics, and customer records.
6. **Action:** Convert probability into a risk band, calculate a simple risk-adjusted LTV, and attach rule-based retention suggestions.
7. **Scope:** It demonstrates an end-to-end workflow using bundled data; some dashboard trends and customer presentation details are illustrative, not live integrations.

**One-sentence takeaway:** “ChurnSense turns customer subscription data into churn-risk estimates and LTV-based retention insights through a Python API.”
