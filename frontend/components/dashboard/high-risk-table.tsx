import React from "react";
import { Customer } from "@/lib/types";
import { RiskBadge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface HighRiskTableProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export function HighRiskTable({
  customers,
  onSelectCustomer,
}: HighRiskTableProps) {
  // Filter and sort for the highest churn risk customers
  const highRiskCustomers = customers
    .filter((c) => c.churnProbability >= 0.7)
    .sort((a, b) => b.churnProbability - a.churnProbability)
    .slice(0, 5);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium">
            <th className="py-3 px-4 font-semibold">Customer</th>
            <th className="py-3 px-4 font-semibold">Contract & Tenure</th>
            <th className="py-3 px-4 font-semibold text-right">Monthly Spend</th>
            <th className="py-3 px-4 font-semibold text-center">Churn Risk</th>
            <th className="py-3 px-4 font-semibold text-right">Estimated LTV</th>
            <th className="py-3 px-4 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {highRiskCustomers.map((cust) => (
            <tr
              key={cust.id}
              onClick={() => onSelectCustomer(cust)}
              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              {/* Customer ID & Name */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[11px] flex items-center justify-center border border-indigo-100 shrink-0">
                    {cust.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {cust.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {cust.id} • {cust.company}
                    </p>
                  </div>
                </div>
              </td>

              {/* Contract & Tenure */}
              <td className="py-3 px-4 text-slate-600">
                <span className="font-medium text-slate-700">{cust.contract}</span>
                <span className="text-[11px] text-slate-400 block">{cust.tenureMonths} mo tenure</span>
              </td>

              {/* Monthly Spend */}
              <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                ${cust.monthlyCharges.toFixed(2)}
              </td>

              {/* Churn Risk */}
              <td className="py-3 px-4 text-center">
                <RiskBadge risk={cust.riskLevel} percentage={cust.churnProbability} />
              </td>

              {/* Estimated LTV */}
              <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                ${cust.estimatedLtv.toLocaleString()}
              </td>

              {/* Action */}
              <td className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCustomer(cust);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
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
  );
}
