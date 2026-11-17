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

The frontend is configured to use the deployed backend at `https://churnsense-f9l9.onrender.com` by default, so it can also be opened from phones, tablets, and other computers without pointing those devices at your computer's `localhost`.

To run the backend locally, start it in one terminal:

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

Open `http://localhost:3000`. The browser makes same-origin requests to the Next.js server, which forwards API requests to the deployed backend at `https://churnsense-f9l9.onrender.com`. The backend's interactive docs are at `https://churnsense-f9l9.onrender.com/docs`. To point the server-side proxy at a backend running on the same computer, create `frontend/.env.local` with:

```env
API_URL=http://127.0.0.1:8000
```

Restart the frontend after changing this setting. `API_URL` is read by the Next.js server and is not embedded in browser JavaScript. For normal use across devices, use the deployed frontend and backend.

The backend uses the included customer data. If its saved model cannot be loaded with the installed package versions, it retrains from the bundled cleaned dataset on startup and saves the compatible model locally as an ignored file.

## Deployment

- **Backend API:** [https://churnsense-f9l9.onrender.com](https://churnsense-f9l9.onrender.com)
- **API documentation:** [https://churnsense-f9l9.onrender.com/docs](https://churnsense-f9l9.onrender.com/docs)
- **Frontend:** [https://churnsense1.vercel.app](https://churnsense1.vercel.app)

In Vercel, set the server-side environment variable `API_URL` to `https://churnsense-f9l9.onrender.com`, then redeploy the frontend. The browser calls the frontend's same-origin proxy, so it does not need direct cross-origin access to the backend. If another application needs to call the backend directly from a browser, add that application's exact origin to the backend's comma-separated `CHURNSENSE_ALLOWED_ORIGINS` environment variable.

## Objective

To build an end-to-end machine learning application that transforms customer data into actionable insights, helping businesses improve customer retention and understand customer value.