"use client";

import React from "react";
import {
  MetricSummary,
  Customer,
  ChurnDistributionItem,
  RiskDistributionItem,
  LtvTrendPoint,
} from "@/lib/types";
import { MetricCard } from "./metric-card";
import { ChurnDistributionChart } from "./churn-distribution-chart";
import { LtvTrendChart } from "./ltv-trend-chart";
import { RiskDistributionChart } from "./risk-distribution-chart";
import { HighRiskTable } from "./high-risk-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, TrendingDown, DollarSign, AlertOctagon, ArrowRight, Sparkles } from "lucide-react";

interface OverviewViewProps {
  summary: MetricSummary;
  customers: Customer[];
  churnDistribution: ChurnDistributionItem[];
  riskDistribution: RiskDistributionItem[];
  ltvTrends: LtvTrendPoint[];
  onSelectCustomer: (customer: Customer) => void;
  onNavigateTab: (tab: "churn" | "ltv" | "customers") => void;
}

export function OverviewView({
  summary,
  customers,
  churnDistribution,
  riskDistribution,
  ltvTrends,
  onSelectCustomer,
  onNavigateTab,
}: OverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Prominent Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Customers */}
        <MetricCard
          title="Total Customers"
          value={summary.totalCustomers.value.toLocaleString()}
          changePercentage={summary.totalCustomers.changePercentage}
          comparisonPeriod={summary.totalCustomers.comparisonPeriod}
          trend={summary.totalCustomers.trend}
          icon={Users}
        />

        {/* 2. Overall Churn Rate */}
        <MetricCard
          title="Overall Churn Rate"
          value={`${summary.overallChurnRate.value}%`}
          changePercentage={summary.overallChurnRate.changePercentage}
          comparisonPeriod={summary.overallChurnRate.comparisonPeriod}
          trend={summary.overallChurnRate.trend}
          isInverseGood={true}
          icon={TrendingDown}
        />

        {/* 3. Average Customer LTV */}
        <MetricCard
          title="Average Customer LTV"
          value={`$${summary.averageLtv.value.toLocaleString()}`}
          changePercentage={summary.averageLtv.changePercentage}
          comparisonPeriod={summary.averageLtv.comparisonPeriod}
          trend={summary.averageLtv.trend}
          icon={DollarSign}
        />

        {/* 4. Revenue at Risk */}
        <MetricCard
          title="Revenue at Risk"
          value={`$${summary.revenueAtRisk.value.toLocaleString()}`}
          changePercentage={summary.revenueAtRisk.changePercentage}
          comparisonPeriod={summary.revenueAtRisk.comparisonPeriod}
          trend={summary.revenueAtRisk.trend}
          isInverseGood={true}
          icon={AlertOctagon}
        />
      </div>

      {/* Row 1 Charts: Churn Distribution & LTV Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Churn Distribution Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Customer Churn Distribution</CardTitle>
              <CardDescription>
                Number of customers across ML predicted churn probability brackets
              </CardDescription>
            </div>
            <button
              onClick={() => onNavigateTab("churn")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Analyze
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </CardHeader>
          <CardContent>
            <ChurnDistributionChart data={churnDistribution} />
          </CardContent>
        </Card>

        {/* Customer Lifetime Value Trend Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Customer Lifetime Value Trend</CardTitle>
              <CardDescription>
                Monthly portfolio LTV progression and projected trajectory
              </CardDescription>
            </div>
            <button
              onClick={() => onNavigateTab("ltv")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Cohort View
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </CardHeader>
          <CardContent>
            <LtvTrendChart data={ltvTrends} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Customer Risk Distribution & Highest Churn Risk Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Risk Distribution (Donut & Segments) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <CardTitle>Customer Risk Distribution</CardTitle>
                  <CardDescription>
                    Segmentation across low, medium, and high-risk tiers
                  </CardDescription>
                </div>
                <button
                  onClick={() => onNavigateTab("churn")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  Analyze
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent>
                <RiskDistributionChart
                  data={riskDistribution}
                  totalCustomers={summary.totalCustomers.value}
                />
              </CardContent>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] text-slate-500">
                88% Retained or Stable Base
              </span>
              <button
                onClick={() => onNavigateTab("churn")}
                className="font-medium text-indigo-600 hover:underline cursor-pointer"
              >
                Deep-dive churn factors →
              </button>
            </div>
          </Card>
        </div>

        {/* Compact Table Showing Customers with Highest Churn Risk */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <CardTitle>Immediate Attention: Highest Churn Risk</CardTitle>
                  <CardDescription>
                    Accounts requiring immediate intervention based on ML risk scores
                  </CardDescription>
                </div>
                <button
                  onClick={() => onNavigateTab("customers")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent className="p-0">
                <HighRiskTable
                  customers={customers}
                  onSelectCustomer={onSelectCustomer}
                />
              </CardContent>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                5 of 341 high-risk accounts shown
              </span>
              <button
                onClick={() => onNavigateTab("customers")}
                className="font-medium text-indigo-600 hover:underline cursor-pointer"
              >
                Inspect full risk registry →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
