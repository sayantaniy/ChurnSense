"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LtvTrendPoint } from "@/lib/types";

interface LtvTrendChartProps {
  data: LtvTrendPoint[];
}

export function LtvTrendChart({ data }: LtvTrendChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="ltvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818CF8" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
            domain={["dataMin - 300", "dataMax + 300"]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5">
                    <p className="font-semibold text-slate-800">{label} Cohort</p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        Avg LTV:
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        ${payload[0]?.value?.toLocaleString()}
                      </span>
                    </div>
                    {payload[1] && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-300" />
                          Projected:
                        </span>
                        <span className="font-mono text-slate-700">
                          ${payload[1]?.value?.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="averageLtv"
            stroke="#4F46E5"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#ltvGradient)"
            name="Actual Avg LTV"
          />
          <Area
            type="monotone"
            dataKey="projectedLtv"
            stroke="#818CF8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#projectedGradient)"
            name="Projected LTV"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
