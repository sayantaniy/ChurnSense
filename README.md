# ChurnSense

**An ML-powered Customer Churn Prediction & Lifetime Value Estimation System.**

ChurnSense is a machine learning project designed to help businesses identify customers who are likely to discontinue their subscriptions and estimate their Customer Lifetime Value (LTV).

## Features

- **Churn Prediction:** Identify customers at risk of leaving using machine learning.
- **LTV Estimation:** Estimate the potential financial value of customers.
- **Customer Analytics:** Review backend-calculated churn and LTV metrics and search customer records.
- **Simple Frontend:** View live backend metrics, customer records, and churn predictions. The frontend does not substitute sample data when the API is unavailable.

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI
- **Machine Learning:** Scikit-learn, Pandas, NumPy
- **Data:** CSV customer dataset

## Run locally

Requirements: Python 3.10+ and Node.js 20.9+.

In the first terminal, install and start the backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

On Windows, activate the environment with `.venv\Scripts\activate` instead of `source .venv/bin/activate`.

In a second terminal, install and start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. The backend API is at `http://127.0.0.1:8000` and its interactive docs are at `http://127.0.0.1:8000/docs`. In local development the frontend uses that backend URL by default. If the backend runs at a different address, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` and restart the frontend.

The backend uses the included customer data. If its saved model cannot be loaded with the installed package versions, it retrains from the bundled cleaned dataset on startup and saves the compatible model locally as an ignored file.

## Objective

To build an end-to-end machine learning application that transforms customer data into actionable insights, helping businesses improve customer retention and understand customer value.