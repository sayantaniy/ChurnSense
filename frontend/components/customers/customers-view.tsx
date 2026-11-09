"use client";

import React, { useState, useMemo } from "react";
import { Customer } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Download,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  UserX,
} from "lucide-react";

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

type SortField = "name" | "tenureMonths" | "monthlyCharges" | "churnProbability" | "estimatedLtv";

export function CustomersView({ customers, onSelectCustomer }: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [selectedContract, setSelectedContract] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("churnProbability");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRiskChange = (val: string) => {
    setSelectedRisk(val);
    setCurrentPage(1);
  };

  const handleContractChange = (val: string) => {
    setSelectedContract(val);
    setCurrentPage(1);
  };

  // Filtering & Sorting
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRisk = selectedRisk === "All" || c.riskLevel === selectedRisk;
        const matchesContract = selectedContract === "All" || c.contract === selectedContract;

        return matchesSearch && matchesRisk && matchesContract;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? (aVal as string).localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal as string);
        }
        return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
  }, [customers, searchQuery, selectedRisk, selectedContract, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Company",
      "Email",
      "Tenure (Months)",
      "Monthly Charges ($)",
      "Total Charges ($)",
      "Contract",
      "Payment Method",
      "Support Tickets",
      "Churn Probability",
      "Risk Level",
      "Estimated LTV ($)",
    ];

    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.company}"`,
      c.email,
      c.tenureMonths,
      c.monthlyCharges.toFixed(2),
      c.totalCharges.toFixed(2),
      `"${c.contract}"`,
      `"${c.paymentMethod}"`,
      c.supportTicketsLast90Days,
      (c.churnProbability * 100).toFixed(1) + "%",
      c.riskLevel,
      c.estimatedLtv,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `churnsense_customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Filters */}
      <Card>
        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, company, email, or ID..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          {/* Filter Pills & Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Risk Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Risk:
              </span>
              {["All", "High", "Medium", "Low"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleRiskChange(lvl)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedRisk === lvl
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Contract Filter */}
            <select
              value={selectedContract}
              onChange={(e) => handleContractChange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>

            {/* Export CSV */}
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Customer Directory & Retention Registry</CardTitle>
              <CardDescription>
                Showing {filteredCustomers.length} of {customers.length} total customers
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400">Click any row to view ML prediction dossier</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            /* Meaningful Empty State */
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <UserX className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No customers found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No accounts match &quot;{searchQuery}&quot; with selected filters. Try adjusting your
                search terms or clearing the risk filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  handleSearchChange("");
                  handleRiskChange("All");
                  handleContractChange("All");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium">
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1.5">
                        Customer ID & Name
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800"
                      onClick={() => handleSort("tenureMonths")}
                    >
                      <div className="flex items-center gap-1.5">
                        Tenure
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold">Contract</th>
                    <th
                      className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-800"
                      onClick={() => handleSort("monthlyCharges")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Monthly Spend
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 font-semibold text-center cursor-pointer hover:text-slate-800"
                      onClick={() => handleSort("churnProbability")}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        Churn Probability
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-center">Risk Level</th>
                    <th
                      className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-800"
                      onClick={() => handleSort("estimatedLtv")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Estimated LTV
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCustomers.map((cust) => (
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

                      {/* Tenure */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-mono font-medium">{cust.tenureMonths}</span> mos
                      </td>

                      {/* Contract */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {cust.contract}
                        </span>
                      </td>

                      {/* Monthly Spend */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        ${cust.monthlyCharges.toFixed(2)}
                      </td>

                      {/* Churn Probability */}
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

                      {/* Risk Level */}
                      <td className="py-3 px-4 text-center">
                        <RiskBadge risk={cust.riskLevel} />
                      </td>

                      {/* Estimated LTV */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
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
          )}
        </CardContent>

        {/* Pagination Footer */}
        {filteredCustomers.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} accounts
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <span className="px-2 font-mono font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
