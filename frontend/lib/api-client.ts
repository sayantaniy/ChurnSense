import type {
  Customer,
  CustomerPredictionInput,
  MetricSummary,
  PredictionResult,
  RiskLevel,
} from "./types";

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const requestTimeoutMs = 10_000;

function getBaseUrl(): string {
  const baseUrl = configuredBaseUrl || (
    process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : ""
  );
  if (!baseUrl) {
    throw new Error(
      "Backend URL is not configured. Set NEXT_PUBLIC_API_URL to the public backend URL in your deployment settings, then redeploy."
    );
  }

  if (typeof window !== "undefined") {
    const url = new URL(baseUrl, window.location.origin);
    const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    if (
      loopbackHosts.has(url.hostname) &&
      !loopbackHosts.has(window.location.hostname)
    ) {
      throw new Error(
        "The deployed frontend is pointed at localhost, which is only reachable on your own device. Set NEXT_PUBLIC_API_URL to the public backend URL in your deployment settings, then redeploy."
      );
    }
    if (window.location.protocol === "https:" && url.protocol !== "https:" && url.origin !== window.location.origin) {
      throw new Error(
        "The deployed frontend requires an HTTPS backend URL. Set NEXT_PUBLIC_API_URL to the public HTTPS backend URL, then redeploy."
      );
    }
  }

  return baseUrl.replace(/\/+$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
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
      throw new Error("The backend did not respond within 10 seconds. Check that the service is running and publicly reachable.");
    }
    if (error instanceof TypeError) {
      throw new Error("Could not reach the backend. Check the backend URL, CORS settings, and service availability.");
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
