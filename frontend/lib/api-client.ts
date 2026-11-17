import type {
  Customer,
  CustomerPredictionInput,
  MetricSummary,
  PredictionResult,
  RiskLevel,
} from "./types";

const requestTimeoutMs = 95_000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("The frontend server did not respond within 95 seconds.");
    }
    if (error instanceof TypeError) {
      throw new Error("Could not reach the frontend server. Check that the service is available.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

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
