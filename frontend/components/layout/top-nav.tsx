import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, X, ArrowUpRight } from "lucide-react";
import { Customer } from "@/lib/types";
import { RiskBadge } from "@/components/ui/badge";

interface TopNavProps {
  title: string;
  description: string;
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onOpenMobileMenu: () => void;
}

export function TopNav({
  title,
  description,
  customers,
  onSelectCustomer,
  onOpenMobileMenu,
}: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filtered = searchQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Title & Description */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-slate-500 truncate hidden sm:block">
            {description}
          </p>
        </div>
      </div>

      {/* Right Controls: Customer Quick Lookup & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Customer Lookup Search */}
        <div className="relative w-48 sm:w-72" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search customer, ID, or company..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Matching Accounts ({filtered.length})
              </div>
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No customers found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                filtered.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => {
                      onSelectCustomer(cust);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {cust.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                          {cust.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{cust.company}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <RiskBadge risk={cust.riskLevel} />
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => alert("Alerts: 3 high-risk customers flagged this week.")}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-medium text-xs flex items-center justify-center">
            SM
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">Sayantani M.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Retention Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
