"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  Customer,
  CustomerPredictionInput,
  MetricSummary,
  PredictionResult,
  RiskLevel,
} from "@/lib/types";

type View = "overview" | "customers" | "prediction";

const pageSize = 25;

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function RiskLabel({ risk }: { risk: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    Low: "risk-low",
    Medium: "risk-medium",
    High: "risk-high",
  };
  return <span className={`risk-label ${styles[risk]}`}>{risk}</span>;
}

function CustomerTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return <p className="p-6 text-sm text-slate-500">No customers match these filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Contract</th>
            <th className="text-right">Tenure</th>
            <th className="text-right">Monthly charge</th>
            <th className="text-right">Churn probability</th>
            <th>Risk</th>
            <th className="text-right">Estimated LTV</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="customer-id whitespace-nowrap">{customer.id}</td>
              <td className="text-slate-600">{customer.contract}</td>
              <td className="text-right text-slate-600">{customer.tenureMonths} mo</td>
              <td className="text-right text-slate-600">{money(customer.monthlyCharges)}</td>
              <td className="text-right text-slate-600">
                {(customer.churnProbability * 100).toFixed(1)}%
              </td>
              <td><RiskLabel risk={customer.riskLevel} /></td>
              <td className="text-right font-semibold text-slate-900">
                {money(customer.estimatedLtv)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [highRiskCustomers, setHighRiskCustomers] = useState<Customer[]>([]);
  const [health, setHealth] = useState<{ status: string; model_loaded: boolean } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"" | RiskLevel>("");
  const [contractFilter, setContractFilter] = useState("");
  const [customerPage, setCustomerPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [tenure, setTenure] = useState("");
  const [monthlyCharges, setMonthlyCharges] = useState("");
  const [contract, setContract] = useState("");
  const [internetService, setInternetService] = useState("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      apiClient.getHealth(),
      apiClient.getMetricsSummary(),
      apiClient.getCustomers({ riskLevel: "High", limit: 5 }),
    ]).then(([healthResult, summaryResult, customersResult]) => {
      if (!active) return;
      const failures: string[] = [];
      if (healthResult.status === "fulfilled") {
        setHealth(healthResult.value);
        setConnectionError(
          healthResult.value.status === "healthy" && healthResult.value.model_loaded
            ? null
            : "Backend responded but the model is not ready."
        );
      } else {
        const message = healthResult.reason instanceof Error ? healthResult.reason.message : "Health check failed";
        failures.push(message);
        setConnectionError(message);
      }
      if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
      else failures.push(summaryResult.reason instanceof Error ? summaryResult.reason.message : "Metrics request failed");
      if (customersResult.status === "fulfilled") setHighRiskCustomers(customersResult.value);
      else failures.push(customersResult.reason instanceof Error ? customersResult.reason.message : "Customer request failed");
      setOverviewError(failures.length ? failures.join(". ") : null);
      setOverviewLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setCustomerPage(0);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    if (view !== "customers") return;
    let active = true;
    apiClient.getCustomers({
      search,
      riskLevel: riskFilter || undefined,
      contract: contractFilter || undefined,
      limit: pageSize + 1,
      offset: customerPage * pageSize,
    }).then((results) => {
      if (!active) return;
      setCustomers(results.slice(0, pageSize));
      setHasNextPage(results.length > pageSize);
      setCustomerError(null);
      setCustomerLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setCustomerError(error instanceof Error ? error.message : "Could not load customers.");
      setCustomers([]);
      setHasNextPage(false);
      setCustomerLoading(false);
    });
    return () => { active = false; };
  }, [view, search, riskFilter, contractFilter, customerPage]);

  const runPrediction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPredictionLoading(true);
    setPredictionError(null);
    setPrediction(null);
    const input: CustomerPredictionInput = {
      tenureMonths: Number(tenure),
      monthlyCharges: Number(monthlyCharges),
      contract,
      internetService,
    };
    try {
      setPrediction(await apiClient.predictCustomer(input));
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : "Prediction request failed.");
    } finally {
      setPredictionLoading(false);
    }
  };

  const nav: { id: View; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "customers", label: "Customers" },
    { id: "prediction", label: "Predict churn" },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M12 32.5V27M19.5 32.5V21M27 32.5V24" stroke="url(#brand-bars)" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M12 19.5L19.5 14.5L26.5 18L36 10.5" stroke="#F4EDE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="36" cy="10.5" r="3" fill="#FF6B5B" stroke="#F4EDE0" strokeWidth="1.5" />
                <defs>
                  <linearGradient id="brand-bars" x1="12" y1="21" x2="27" y2="33" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F4EDE0" />
                    <stop offset="1" stopColor="#FF6B5B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <p className="brand-eyebrow">RETENTION INTELLIGENCE</p>
              <h1 className="brand-title">ChurnSense</h1>
              <p className="brand-subtitle">Customer intelligence</p>
            </div>
          </div>
          <div className="connection-pill" aria-live="polite">
            <span className={`connection-indicator ${health?.status === "healthy" && health.model_loaded ? "is-connected" : ""}`} />
            <span className="connection-copy">
              <span className="connection-kicker">SYSTEM STATUS</span>
              <span className="connection-text">
                {health?.status === "healthy" && health.model_loaded
                  ? "Backend connected"
                  : connectionError
                    ? "Connection issue"
                    : "Checking backend"}
              </span>
            </span>
            <span className="connection-chevron" aria-hidden="true">↗</span>
          </div>
        </div>
      </header>

      <main className="main-content mx-auto max-w-7xl px-5">
        <nav className="main-nav mb-7" aria-label="Main navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "customers") {
                  setCustomerLoading(true);
                  setCustomerError(null);
                }
                setView(item.id);
              }}
              className={`nav-tab whitespace-nowrap text-sm font-medium ${view === item.id ? "is-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {view === "overview" && (
          <section className="page-section space-y-6">
            <div className="page-heading">
              <div>
                <p className="page-eyebrow"><span /> CUSTOMER INTELLIGENCE</p>
                <h2 className="text-lg font-semibold">Customer health, at a glance</h2>
                <p className="mt-1 text-sm text-slate-500">A considered view of retention, customer value, and the accounts that need attention.</p>
              </div>
              <div className="snapshot-badge">
                <span className="snapshot-orbit" aria-hidden="true"><i /></span>
                <span><small>YOUR WORKSPACE</small><strong>Portfolio overview</strong></span>
              </div>
            </div>
            {overviewError && <p role="alert" className="error-message">{overviewError}</p>}
            {overviewLoading && (
              <div className="metric-grid" aria-label="Loading customer metrics">
                {["01", "02", "03", "04"].map((item) => (
                  <div key={item} className="metric-card metric-skeleton" aria-hidden="true">
                    <span className="skeleton-line skeleton-label" />
                    <span className="skeleton-line skeleton-value" />
                    <span className="skeleton-line skeleton-caption" />
                  </div>
                ))}
              </div>
            )}
            {summary && (
              <div className="metric-grid">
                {[
                  ["Customers", summary.totalCustomers.value.toLocaleString()],
                  ["Historical churn rate", `${summary.overallChurnRate.value}%`],
                  ["Average estimated LTV", money(summary.averageLtv.value)],
                  ["Annualized charges in high-risk accounts", money(summary.revenueAtRisk.value)],
                ].map(([label, value], index) => (
                  <article key={label} className={`metric-card metric-card-${index + 1}`}>
                    <div className="metric-card-topline">
                      <span className="metric-label">{label}</span>
                      <span className="metric-index">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="metric-value">{value}</p>
                    <p className="metric-context">{["CUSTOMER BASE", "HISTORICAL PERFORMANCE", "CUSTOMER VALUE", "RETENTION OPPORTUNITY"][index]}</p>
                  </article>
                ))}
              </div>
            )}
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-eyebrow">RETENTION WATCH</p>
                  <h3 className="font-semibold">Highest churn probability</h3>
                  <p className="mt-1 text-sm text-slate-500">Top high-risk records returned by the customer API.</p>
                </div>
                <span className="panel-mark" aria-hidden="true">↗</span>
              </div>
              {overviewLoading ? <p className="p-5 text-sm text-slate-500">Loading customers…</p> : <CustomerTable customers={highRiskCustomers} />}
            </section>
          </section>
        )}

        {view === "customers" && (
          <section className="page-section space-y-5">
            <div className="page-heading">
              <div>
                <p className="page-eyebrow"><span /> CUSTOMER DIRECTORY</p>
                <h2 className="text-lg font-semibold">Your customer portfolio</h2>
                <p className="mt-1 text-sm text-slate-500">Find an account, explore risk, and see estimated lifetime value.</p>
              </div>
            </div>
            <div className="filter-panel sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Search customer ID</span>
                <input
                  value={searchDraft}
                  onChange={(event) => {
                    setSearchDraft(event.target.value);
                    setCustomerLoading(true);
                    setCustomerError(null);
                  }}
                  placeholder="Search customer ID"
                  className="field-control w-full text-sm"
                />
              </label>
              <label>
                <span className="sr-only">Risk level</span>
                <select
                  value={riskFilter}
                  onChange={(event) => {
                    setRiskFilter(event.target.value as "" | RiskLevel);
                    setCustomerPage(0);
                    setCustomerLoading(true);
                    setCustomerError(null);
                  }}
                  className="field-control w-full text-sm sm:w-40"
                >
                  <option value="">All risk levels</option>
                  <option value="High">High risk</option>
                  <option value="Medium">Medium risk</option>
                  <option value="Low">Low risk</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Contract</span>
                <select
                  value={contractFilter}
                  onChange={(event) => {
                    setContractFilter(event.target.value);
                    setCustomerPage(0);
                    setCustomerLoading(true);
                    setCustomerError(null);
                  }}
                  className="field-control w-full text-sm sm:w-44"
                >
                  <option value="">All contracts</option>
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </label>
            </div>
            <section className="panel">
              {customerError && <p role="alert" className="error-message m-4">{customerError}</p>}
              {customerLoading ? <p className="p-6 text-sm text-slate-500">Loading customers…</p> : <CustomerTable customers={customers} />}
            </section>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Page {customerPage + 1}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={customerPage === 0 || customerLoading}
                  onClick={() => {
                    setCustomerLoading(true);
                    setCustomerError(null);
                    setCustomerPage((page) => page - 1);
                  }}
                  className="pagination-button"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!hasNextPage || customerLoading}
                  onClick={() => {
                    setCustomerLoading(true);
                    setCustomerError(null);
                    setCustomerPage((page) => page + 1);
                  }}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}

        {view === "prediction" && (
          <section className="page-section mx-auto max-w-2xl space-y-5">
            <div className="page-heading">
              <div>
                <p className="page-eyebrow"><span /> PREDICTIVE INSIGHTS</p>
                <h2 className="text-lg font-semibold">Understand a customer’s risk</h2>
                <p className="mt-1 text-sm text-slate-500">A few account details are all it takes to uncover a clearer next step.</p>
              </div>
            </div>
            <form onSubmit={runPrediction} className="form-panel space-y-5">
              <div className="form-intro">
                <span className="form-intro-mark" aria-hidden="true">CS</span>
                <span><strong>Customer profile</strong><small>Tell us a little about this account.</small></span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-label">
                  Tenure (months)
                  <input required type="number" min="0" max="72" value={tenure} onChange={(event) => setTenure(event.target.value)} className="field-control w-full font-normal" />
                </label>
                <label className="field-label">
                  Monthly charge
                  <input required type="number" min="0" step="0.01" value={monthlyCharges} onChange={(event) => setMonthlyCharges(event.target.value)} className="field-control w-full font-normal" />
                </label>
                <label className="field-label">
                  Contract
                  <select required value={contract} onChange={(event) => setContract(event.target.value)} className="field-control w-full font-normal">
                    <option value="" disabled>Select contract</option>
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </label>
                <label className="field-label">
                  Internet service
                  <select required value={internetService} onChange={(event) => setInternetService(event.target.value)} className="field-control w-full font-normal">
                    <option value="" disabled>Select service</option>
                    <option value="DSL">DSL</option>
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="No">No internet service</option>
                  </select>
                </label>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">The API supplies its configured defaults for profile details not entered here.</p>
              <button
                type="submit"
                disabled={predictionLoading}
                className="primary-button"
              >
                {predictionLoading ? "Requesting prediction…" : "Predict churn"}
              </button>
            </form>
            {predictionError && <p role="alert" className="error-message">{predictionError}</p>}
            {prediction && (
              <section className="result-panel space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Model prediction</p>
                    <p className="mt-1 text-2xl font-semibold">{prediction.churn_prediction === "Yes" ? "Churn predicted" : "Churn not predicted"}</p>
                  </div>
                  <RiskLabel risk={prediction.risk_level} />
                </div>
                <dl className="grid gap-3 sm:grid-cols-3">
                  <div className="result-metric"><dt>Churn probability</dt><dd>{prediction.churn_probability}%</dd></div>
                  <div className="result-metric"><dt>Estimated LTV</dt><dd>{money(prediction.estimated_ltv)}</dd></div>
                  <div className="result-metric"><dt>LTV segment</dt><dd>{prediction.ltv_segment}</dd></div>
                </dl>
                <div>
                  <h3 className="text-sm font-semibold">Risk factors</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {prediction.risk_factors.map((factor) => <li key={factor}>{factor}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Recommended action</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{prediction.recommended_action}</p>
                </div>
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
