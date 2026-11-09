import React from "react";
import { RiskLevel } from "@/lib/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "low" | "medium" | "high" | "secondary" | "outline" | "indigo";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  let variantStyles = "bg-slate-100 text-slate-700 border-slate-200";

  if (variant === "low") {
    variantStyles = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
  } else if (variant === "medium") {
    variantStyles = "bg-amber-50 text-amber-700 border-amber-200/60";
  } else if (variant === "high") {
    variantStyles = "bg-rose-50 text-rose-700 border-rose-200/60";
  } else if (variant === "secondary") {
    variantStyles = "bg-slate-50 text-slate-600 border-slate-200";
  } else if (variant === "indigo") {
    variantStyles = "bg-indigo-50 text-indigo-700 border-indigo-200/60";
  } else if (variant === "outline") {
    variantStyles = "bg-white text-slate-700 border-slate-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ risk, percentage }: { risk: RiskLevel; percentage?: number }) {
  const variant = risk === "High" ? "high" : risk === "Medium" ? "medium" : "low";
  const dotColor =
    risk === "High"
      ? "bg-rose-500"
      : risk === "Medium"
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <Badge variant={variant}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{risk} Risk</span>
      {typeof percentage === "number" && (
        <span className="opacity-75 font-mono">({Math.round(percentage * 100)}%)</span>
      )}
    </Badge>
  );
}
