import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  changePercentage: number;
  comparisonPeriod: string;
  trend: "up" | "down" | "neutral";
  isInverseGood?: boolean; // For churn rate & revenue at risk, down is good!
  icon: React.ElementType;
}

export function MetricCard({
  title,
  value,
  changePercentage,
  comparisonPeriod,
  trend,
  isInverseGood = false,
  icon: Icon,
}: MetricCardProps) {
  // Determine if this change is positive for the business
  const isPositive = isInverseGood ? trend === "down" : trend === "up";
  const absChange = Math.abs(changePercentage);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 tracking-wide">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
          <Icon className="w-4 h-4 text-indigo-600" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <span
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium text-[11px] ${
            isPositive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : trend === "down" ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {absChange}%
        </span>
        <span className="text-slate-400 text-[11px] truncate">{comparisonPeriod}</span>
      </div>
    </div>
  );
}
