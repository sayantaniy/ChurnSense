export type RiskLevel = "Low" | "Medium" | "High";

export type ContractType = "Month-to-month" | "One year" | "Two year";

export type PaymentMethod =
  | "Electronic check"
  | "Mailed check"
  | "Bank transfer (automatic)"
  | "Credit card (automatic)";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  avatar: string;
  tenureMonths: number;
  monthlyCharges: number;
  totalCharges: number;
  contract: ContractType;
  paymentMethod: PaymentMethod;
  paperlessBilling: boolean;
  supportTicketsLast90Days: number;
  churnProbability: number; // 0.00 to 1.00
  riskLevel: RiskLevel;
  estimatedLtv: number;
  ltvSegment: "VIP" | "Growth" | "Core" | "At-Risk";
  lastActivity: string;
  riskFactors: string[];
  recommendedAction: string;
}

export interface MetricSummary {
  totalCustomers: {
    value: number;
    changePercentage: number;
    trend: "up" | "down" | "neutral";
    comparisonPeriod: string;
  };
  overallChurnRate: {
    value: number; // percentage, e.g. 14.8
    changePercentage: number;
    trend: "up" | "down" | "neutral"; // down is positive for churn
    comparisonPeriod: string;
  };
  averageLtv: {
    value: number; // dollar value, e.g. 3450
    changePercentage: number;
    trend: "up" | "down" | "neutral";
    comparisonPeriod: string;
  };
  revenueAtRisk: {
    value: number; // dollar value, e.g. 184200
    changePercentage: number;
    trend: "up" | "down" | "neutral";
    comparisonPeriod: string;
  };
}

export interface ChurnDistributionItem {
  range: string;
  count: number;
  percentage: number;
}

export interface RiskDistributionItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  revenue: number;
}

export interface LtvTrendPoint {
  month: string;
  averageLtv: number;
  projectedLtv: number;
  retainedCohorts: number;
}

export interface ContractChurnComparison {
  contract: string;
  churnRate: number;
  customerCount: number;
  avgMonthly: number;
}

export interface LtvCohortSegment {
  tenureBracket: string;
  customerCount: number;
  avgLtv: number;
  totalValue: number;
  churnRisk: number;
}
