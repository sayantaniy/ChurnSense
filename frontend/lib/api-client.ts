/**
 * ChurnSense API Client
 *
 * Designed to connect seamlessly with the upcoming Python FastAPI backend.
 * Currently serves realistic mock data with an API-ready contract.
 *
 * When the backend is ready, set NEXT_PUBLIC_API_URL in .env (e.g. http://localhost:8000)
 */

import {
  Customer,
  MetricSummary,
  ChurnDistributionItem,
  RiskDistributionItem,
  LtvTrendPoint,
  ContractChurnComparison,
  LtvCohortSegment,
} from "./types";
import {
  MOCK_SUMMARY,
  MOCK_CUSTOMERS,
  MOCK_CHURN_DISTRIBUTION,
  MOCK_RISK_DISTRIBUTION,
  MOCK_LTV_TRENDS,
  MOCK_CONTRACT_CHURN,
  MOCK_LTV_COHORTS,
} from "./mock-data";

export const apiClient = {
  /**
   * Base API endpoint (defaults to local FastAPI backend)
   */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",

  /**
   * Fetch top-level dashboard metrics
   */
  async getMetricsSummary(): Promise<MetricSummary> {
    // When live FastAPI backend is running:
    // return fetch(`${this.baseUrl}/api/v1/metrics/summary`).then(r => r.json());
    return Promise.resolve(MOCK_SUMMARY);
  },

  /**
   * Fetch customer churn distribution
   */
  async getChurnDistribution(): Promise<ChurnDistributionItem[]> {
    return Promise.resolve(MOCK_CHURN_DISTRIBUTION);
  },

  /**
   * Fetch customer risk breakdown (low/medium/high)
   */
  async getRiskDistribution(): Promise<RiskDistributionItem[]> {
    return Promise.resolve(MOCK_RISK_DISTRIBUTION);
  },

  /**
   * Fetch LTV trend trajectory
   */
  async getLtvTrends(): Promise<LtvTrendPoint[]> {
    return Promise.resolve(MOCK_LTV_TRENDS);
  },

  /**
   * Fetch contract churn comparison
   */
  async getContractChurn(): Promise<ContractChurnComparison[]> {
    return Promise.resolve(MOCK_CONTRACT_CHURN);
  },

  /**
   * Fetch LTV cohort segments
   */
  async getLtvCohorts(): Promise<LtvCohortSegment[]> {
    return Promise.resolve(MOCK_LTV_COHORTS);
  },

  /**
   * Fetch customer list with optional filtering
   */
  async getCustomers(params?: {
    search?: string;
    riskLevel?: string;
    contract?: string;
    sortBy?: "churnProbability" | "estimatedLtv" | "monthlyCharges" | "tenureMonths";
    sortDirection?: "asc" | "desc";
  }): Promise<Customer[]> {
    let result = [...MOCK_CUSTOMERS];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (params?.riskLevel && params.riskLevel !== "All") {
      result = result.filter((c) => c.riskLevel === params.riskLevel);
    }

    if (params?.contract && params.contract !== "All") {
      result = result.filter((c) => c.contract === params.contract);
    }

    if (params?.sortBy) {
      const field = params.sortBy;
      const dir = params.sortDirection === "asc" ? 1 : -1;
      result.sort((a, b) => (a[field] > b[field] ? dir : -dir));
    }

    return Promise.resolve(result);
  },

  /**
   * Fetch individual customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | undefined> {
    return Promise.resolve(MOCK_CUSTOMERS.find((c) => c.id === id));
  },
};
