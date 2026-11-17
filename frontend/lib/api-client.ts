import type {
  Customer,
  CustomerPredictionInput,
  MetricSummary,
  PredictionResult,
  RiskLevel,
} from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  getHealth: () => request<{ status: string; model_loaded: boolean }>("/api/v1/health"),

  getMetricsSummary: () => request<MetricSummary>("/api/v1/metrics/summary"),

  getCustomers: (params: {
    search?: string;
    riskLevel?: RiskLevel;
    contract?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.riskLevel) query.set("riskLevel", params.riskLevel);
    if (params.contract) query.set("contract", params.contract);
    query.set("sortBy", "churnProbability");
    query.set("sortDirection", "desc");
    query.set("limit", String(params.limit ?? 5));
    query.set("offset", String(params.offset ?? 0));
    return request<Customer[]>(`/api/v1/customers?${query.toString()}`);
  },

  predictCustomer: (input: CustomerPredictionInput) =>
    request<PredictionResult>("/api/v1/predict/churn", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
