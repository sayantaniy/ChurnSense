# ChurnSense

**An ML-powered Customer Churn Prediction & Lifetime Value Estimation System.**

ChurnSense is a machine learning project designed to help businesses identify customers who are likely to discontinue their subscriptions and estimate their Customer Lifetime Value (LTV).

## Features

- **Churn Prediction:** Identify customers at risk of leaving using machine learning.
- **LTV Estimation:** Estimate the potential financial value of customers.
- **Customer Analytics:** Review backend-calculated churn and LTV metrics and search customer records.
- **Simple Frontend:** View live backend metrics, customer records, and churn predictions. The frontend does not substitute sample data when the API is unavailable.

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Python, FastAPI
- **Machine Learning:** Scikit-learn, Pandas, NumPy
- **Data:** CSV customer dataset
- **Visualization:** Recharts

## Run locally

Start the backend from `backend/`:

```bash
uvicorn main:app --reload
```

Start the frontend from `frontend/`:

```bash
npm install
npm run dev
```

The frontend defaults to `http://127.0.0.1:8000` for the API. Set `NEXT_PUBLIC_API_URL` if the backend is hosted elsewhere.

## Objective

To build an end-to-end machine learning application that transforms customer data into actionable insights, helping businesses improve customer retention and understand customer value.