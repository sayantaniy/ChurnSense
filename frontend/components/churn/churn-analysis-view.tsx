"use client";

import React, { useState } from "react";
import { Customer, ChurnDistributionItem, ContractChurnComparison } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChurnDistributionChart } from "@/components/dashboard/churn-distribution-chart";
import { RiskBadge, Badge } from "@/components/ui/badge";
import { MOCK_TOP_CHURN_FACTORS } from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";

interface ChurnAnalysisViewProps {
  customers: Customer[];
  churnDistribution: ChurnDistributionItem[];
  contractChurn: ContractChurnComparison[];
  onSelectCustomer: (customer: Customer) => void;
}

export function ChurnAnalysisView({
  customers,
  churnDistribution,
  contractChurn,
  onSelectCustomer,
}: ChurnAnalysisViewProps) {
  const [selectedRisk, setSelectedRisk] = useState<string>("All");

  const filteredCustomers = customers.filter((c) => {
    if (selectedRisk === "All") return true;
    return c.riskLevel === selectedRisk;
  });

  return (
    <div className="space-y-6">
      {/* 3 Risk Segments Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Risk */}
        <div className="bg-white rounded-xl border border-rose-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              High Risk Segment (&gt;65%)
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">341</span>
            <span className="text-xs text-rose-600 font-medium">(12% of total)</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Revenue at Risk:</span>
              <span className="font-semibold text-slate-800">$184,200 ARR</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Churn Score:</span>
              <span className="font-semibold text-rose-600">78.4%</span>
            </div>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Medium Risk Segment (30-65%)
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">568</span>
            <span className="text-xs text-amber-600 font-medium">(20% of total)</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Vulnerable Revenue:</span>
              <span className="font-semibold text-slate-800">$382,000 ARR</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Churn Score:</span>
              <span className="font-semibold text-amber-600">46.2%</span>
            </div>
          </div>
        </div>

        {/* Low Risk */}
        <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Low Risk Segment (&lt;30%)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">1,931</span>
            <span className="text-xs text-emerald-600 font-medium">(68% of total)</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Secure Revenue:</span>
              <span className="font-semibold text-slate-800">$1,420,000 ARR</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Churn Score:</span>
              <span className="font-semibold text-emerald-600">9.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Probability Distribution & Key Risk Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Probability Distribution Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Churn Probability Distribution</CardTitle>
              <CardDescription>
                Model score frequency across customer base (0.0 to 1.0)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ChurnDistributionChart data={churnDistribution} />
          </CardContent>
        </Card>

        {/* Key Churn Drivers / Feature Attribution */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Key Predictive Churn Drivers</CardTitle>
              <CardDescription>
                Top machine learning feature importances identified by model
              </CardDescription>
            </div>
            <Badge variant="indigo">SHAP Analysis</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_TOP_CHURN_FACTORS.map((factor, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{factor.factor}</p>
                      <p className="text-[11px] text-slate-400">
                        Affects ~{factor.affectedCount} accounts • Category: {factor.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {factor.impact}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Type Breakdown */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Churn Rate by Contract Agreement</CardTitle>
            <CardDescription>
              Comparing retention performance across subscription commitments
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contractChurn.map((c) => (
              <div
                key={c.contract}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{c.contract}</span>
                  <span className="text-[11px] font-mono text-slate-400">{c.customerCount} accounts</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      c.churnRate > 30 ? "text-rose-600" : c.churnRate > 10 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {c.churnRate}%
                  </span>
                  <span className="text-xs text-slate-400">churn rate</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Avg. monthly spend: ${c.avgMonthly.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Table with Churn Probability and Risk Labels */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Customer Churn Risk Registry</CardTitle>
            <CardDescription>
              Ranked list of accounts with machine learning churn scores
            </CardDescription>
          </div>
          {/* Segment Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {["All", "High", "Medium", "Low"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedRisk(lvl)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedRisk === lvl
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium">
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Contract</th>
                  <th className="py-3 px-4 font-semibold">Tenure</th>
                  <th className="py-3 px-4 font-semibold text-right">Monthly Spend</th>
                  <th className="py-3 px-4 font-semibold text-center">Churn Probability</th>
                  <th className="py-3 px-4 font-semibold text-center">Risk Segment</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => onSelectCustomer(cust)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[11px] flex items-center justify-center border border-indigo-100 shrink-0">
                          {cust.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {cust.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {cust.id} • {cust.company}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{cust.contract}</td>
                    <td className="py-3 px-4 text-slate-600">{cust.tenureMonths} mos</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                      ${cust.monthlyCharges.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span
                        className={
                          cust.churnProbability >= 0.65
                            ? "text-rose-600"
                            : cust.churnProbability >= 0.3
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {(cust.churnProbability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskBadge risk={cust.riskLevel} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomer(cust);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        Details
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
