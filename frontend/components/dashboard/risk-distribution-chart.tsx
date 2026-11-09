"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RiskDistributionItem } from "@/lib/types";

interface RiskDistributionChartProps {
  data: RiskDistributionItem[];
  totalCustomers: number;
}

export function RiskDistributionChart({ data, totalCustomers }: RiskDistributionChartProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Centered Donut Chart with inner summary */}
      <div className="relative w-full h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={176}>
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RiskDistributionItem;
                  return (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-md text-xs space-y-1">
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-slate-600">
                        Accounts:{" "}
                        <span className="font-mono font-medium text-slate-900">
                          {item.value.toLocaleString()}
                        </span>{" "}
                        ({item.percentage}%)
                      </p>
                      <p className="text-slate-600">
                        Revenue:{" "}
                        <span className="font-mono font-medium text-slate-900">
                          ${(item.revenue / 1000).toLocaleString()}k ARR
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Callout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {totalCustomers.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
            Accounts
          </span>
        </div>
      </div>

      {/* Segment Breakdown Rows */}
      <div className="space-y-2.5 pt-1">
        {data.map((seg) => (
          <div
            key={seg.name}
            className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
          >
            {/* Row text */}
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-semibold text-slate-800">{seg.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-800">
                  ${(seg.revenue / 1000).toLocaleString()}k
                </span>
                <span className="text-slate-400 text-[11px] font-mono">
                  ({seg.percentage}%)
                </span>
              </div>
            </div>

            {/* Visual mini progress bar */}
            <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${seg.percentage}%`,
                  backgroundColor: seg.color,
                }}
              />
            </div>

            {/* Secondary detail */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{seg.value.toLocaleString()} customers</span>
              <span>ARR Exposure</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
