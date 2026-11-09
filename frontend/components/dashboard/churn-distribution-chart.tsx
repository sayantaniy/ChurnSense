"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChurnDistributionItem } from "@/lib/types";

interface ChurnDistributionChartProps {
  data: ChurnDistributionItem[];
}

export function ChurnDistributionChart({ data }: ChurnDistributionChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="range"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip
            cursor={{ fill: "#F8FAFC" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ChurnDistributionItem;
                return (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1">
                    <p className="font-semibold text-slate-800">Risk Bracket: {item.range}</p>
                    <p className="text-slate-600">
                      Customers: <span className="font-mono font-medium">{item.count.toLocaleString()}</span>
                    </p>
                    <p className="text-indigo-600 font-medium">
                      Share: {item.percentage}% of base
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => {
              // Color gradient from safe emerald to amber to coral
              const colors = ["#10B981", "#34D399", "#FBBF24", "#F87171", "#EF4444"];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
