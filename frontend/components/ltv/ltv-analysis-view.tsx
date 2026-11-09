"use client";

import React from "react";
import { Customer, LtvCohortSegment, LtvTrendPoint } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LtvTrendChart } from "@/components/dashboard/ltv-trend-chart";
import { RiskBadge, Badge } from "@/components/ui/badge";
import { Award, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LtvAnalysisViewProps {
  customers: Customer[];
  ltvTrends: LtvTrendPoint[];
  ltvCohorts: LtvCohortSegment[];
  onSelectCustomer: (customer: Customer) => void;
}

export function LtvAnalysisView({
  customers,
  ltvTrends,
  ltvCohorts,
  onSelectCustomer,
}: LtvAnalysisViewProps) {
  // Sort customers by estimated LTV descending for high-value accounts
  const highValueCustomers = [...customers].sort(
    (a, b) => b.estimatedLtv - a.estimatedLtv
  );

  return (
    <div className="space-y-6">
      {/* 4 LTV Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Average Customer LTV</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            $3,450
          </div>
          <span className="inline-block mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            +8.1% vs last quarter
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Top 10% LTV Threshold</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-indigo-900 tracking-tight">
            $8,400+
          </div>
          <span className="inline-block mt-2 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            284 Enterprise Accounts
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Portfolio Value</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            $9.80M
          </div>
          <span className="inline-block mt-2 text-[11px] font-medium text-slate-500">
            Across 2,840 active subs
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Payback Period (CAC)</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            4.2 mo
          </div>
          <span className="inline-block mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Healthy 5.8x LTV:CAC
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LTV Trajectory Trend */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Customer Lifetime Value Trajectory</CardTitle>
              <CardDescription>
                Historical average LTV vs machine learning projected value
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <LtvTrendChart data={ltvTrends} />
          </CardContent>
        </Card>

        {/* LTV by Tenure Progression */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Average LTV by Customer Tenure</CardTitle>
              <CardDescription>
                How customer lifetime value expands as tenure matures
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ltvCohorts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="tenureBracket"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as LtvCohortSegment;
                        return (
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1">
                            <p className="font-semibold text-slate-800">{item.tenureBracket}</p>
                            <p className="text-slate-600">
                              Avg LTV: <span className="font-mono font-semibold text-indigo-600">${item.avgLtv.toLocaleString()}</span>
                            </p>
                            <p className="text-slate-500">Accounts: {item.customerCount}</p>
                            <p className="text-slate-500">Churn Risk: {item.churnRisk}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgLtv" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Progression Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cohort Revenue Breakdown</CardTitle>
            <CardDescription>
              Segmentation by customer lifecycle stage and retention vulnerability
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium">
                  <th className="py-3 px-4 font-semibold">Tenure Cohort</th>
                  <th className="py-3 px-4 font-semibold text-center">Accounts</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg Customer LTV</th>
                  <th className="py-3 px-4 font-semibold text-right">Cohort Total Value</th>
                  <th className="py-3 px-4 font-semibold text-center">Historical Churn Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ltvCohorts.map((cohort) => (
                  <tr key={cohort.tenureBracket} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {cohort.tenureBracket}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {cohort.customerCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-indigo-700">
                      ${cohort.avgLtv.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                      ${(cohort.totalValue / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-medium ${
                          cohort.churnRisk > 25
                            ? "bg-rose-50 text-rose-700"
                            : cohort.churnRisk > 10
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {cohort.churnRisk}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Highest-Value Customer Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <div>
              <CardTitle>Highest-Value Customer Accounts (VIP)</CardTitle>
              <CardDescription>
                Top revenue contributors and their corresponding churn defense status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium">
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold">Tenure</th>
                  <th className="py-3 px-4 font-semibold text-right">Monthly Spend</th>
                  <th className="py-3 px-4 font-semibold text-right">Estimated LTV</th>
                  <th className="py-3 px-4 font-semibold text-center">Churn Risk</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highValueCustomers.slice(0, 6).map((cust) => (
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
                    <td className="py-3 px-4">
                      <Badge variant="indigo">{cust.ltvSegment}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{cust.tenureMonths} mos</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                      ${cust.monthlyCharges.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-900">
                      ${cust.estimatedLtv.toLocaleString()}
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
                        Inspect
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
