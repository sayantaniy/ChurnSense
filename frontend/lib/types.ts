export type RiskLevel = "Low" | "Medium" | "High";

export interface Customer {
  id: string;
  tenureMonths: number;
  monthlyCharges: number;
  totalCharges: number;
  contract: string;
  churnProbability: number;
  riskLevel: RiskLevel;
  estimatedLtv: number;
}

export interface MetricSummary {
  totalCustomers: { value: number };
  overallChurnRate: { value: number };
  averageLtv: { value: number };
  revenueAtRisk: { value: number };
}

export interface CustomerPredictionInput {
  tenureMonths: number;
  monthlyCharges: number;
  contract: string;
  internetService: string;
}

export interface PredictionResult {
  churn_prediction: "Yes" | "No";
  churn_probability: number;
  risk_level: RiskLevel;
  estimated_ltv: number;
  ltv_segment: string;
  risk_factors: string[];
  recommended_action: string;
}
