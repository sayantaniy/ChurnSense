import React, { useEffect } from "react";
import { Customer } from "@/lib/types";
import { RiskBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  AlertTriangle,
  DollarSign,
  Calendar,
  CreditCard,
  LifeBuoy,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface CustomerDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export function CustomerDrawer({ customer, onClose, onSelectAction }: CustomerDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (customer) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [customer, onClose]);

  if (!customer) return null;

  const churnPct = Math.round(customer.churnProbability * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center shadow-xs">
              {customer.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-800">{customer.name}</h2>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {customer.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{customer.company} • {customer.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Risk & LTV Headline Hero Banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${
              customer.riskLevel === "High"
                ? "bg-rose-50/70 border-rose-100"
                : customer.riskLevel === "Medium"
                ? "bg-amber-50/70 border-amber-100"
                : "bg-emerald-50/70 border-emerald-100"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Churn Probability</span>
                <RiskBadge risk={customer.riskLevel} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-3xl font-bold tracking-tight ${
                  customer.riskLevel === "High"
                    ? "text-rose-600"
                    : customer.riskLevel === "Medium"
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}>
                  {churnPct}%
                </span>
                <span className="text-xs text-slate-500">ML Confidence: 94%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    customer.riskLevel === "High"
                      ? "bg-rose-500"
                      : customer.riskLevel === "Medium"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${churnPct}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Estimated LTV</span>
                <Badge variant="indigo">{customer.ltvSegment} Tier</Badge>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-indigo-900">
                  ${customer.estimatedLtv.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                ${customer.monthlyCharges}/mo × expected cycle
              </p>
            </div>
          </div>

          {/* AI Explainability & Risk Drivers */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Key Churn Drivers (ML Attribution)
            </div>
            <ul className="space-y-2">
              {customer.riskFactors.map((factor, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Retention Action */}
          <div className="bg-indigo-900 text-white rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-indigo-700">
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-indigo-200 uppercase">
                AI Retention Recommendation
              </span>
            </div>
            <p className="text-sm text-indigo-50 leading-relaxed font-medium">
              {customer.recommendedAction}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="bg-white text-indigo-900 hover:bg-indigo-50 border-0 font-medium"
                onClick={() => {
                  if (onSelectAction) {
                    onSelectAction(customer.recommendedAction);
                  }
                  alert(`Retention action dispatched for ${customer.name}: "${customer.recommendedAction}"`);
                  onClose();
                }}
              >
                Execute Retention Playbook
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Customer Profile Telemetry */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account Attributes & Billing
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Tenure</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {customer.tenureMonths} Months
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Contract Agreement</span>
                <p className="font-semibold text-slate-800">{customer.contract}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Monthly Charges</span>
                <p className="font-semibold text-slate-800">
                  ${customer.monthlyCharges.toFixed(2)}/mo
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Total Invoiced to Date</span>
                <p className="font-semibold text-slate-800">
                  ${customer.totalCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Payment Channel</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  {customer.paymentMethod}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">Support Tickets (90d)</span>
                <p className={`font-semibold flex items-center gap-1.5 ${
                  customer.supportTicketsLast90Days > 3 ? "text-rose-600" : "text-slate-800"
                }`}>
                  <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
                  {customer.supportTicketsLast90Days} tickets
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-400">Last activity: {customer.lastActivity}</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
