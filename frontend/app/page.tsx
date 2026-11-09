"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { CustomerDrawer } from "@/components/customers/customer-drawer";
import { OverviewView } from "@/components/dashboard/overview-view";
import { ChurnAnalysisView } from "@/components/churn/churn-analysis-view";
import { LtvAnalysisView } from "@/components/ltv/ltv-analysis-view";
import { CustomersView } from "@/components/customers/customers-view";
import { SettingsView } from "@/components/settings/settings-view";
import { apiClient } from "@/lib/api-client";
import {
  Customer,
  MetricSummary,
  ChurnDistributionItem,
  RiskDistributionItem,
  LtvTrendPoint,
  ContractChurnComparison,
  LtvCohortSegment,
} from "@/lib/types";
import {
  MOCK_SUMMARY,
  MOCK_CUSTOMERS,
  MOCK_CHURN_DISTRIBUTION,
  MOCK_RISK_DISTRIBUTION,
  MOCK_LTV_TRENDS,
  MOCK_CONTRACT_CHURN,
  MOCK_LTV_COHORTS,
} from "@/lib/mock-data";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Loaded state
  const [summary, setSummary] = useState<MetricSummary>(MOCK_SUMMARY);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [churnDistribution, setChurnDistribution] =
    useState<ChurnDistributionItem[]>(MOCK_CHURN_DISTRIBUTION);
  const [riskDistribution, setRiskDistribution] =
    useState<RiskDistributionItem[]>(MOCK_RISK_DISTRIBUTION);
  const [ltvTrends, setLtvTrends] = useState<LtvTrendPoint[]>(MOCK_LTV_TRENDS);
  const [contractChurn, setContractChurn] =
    useState<ContractChurnComparison[]>(MOCK_CONTRACT_CHURN);
  const [ltvCohorts, setLtvCohorts] = useState<LtvCohortSegment[]>(MOCK_LTV_COHORTS);

  useEffect(() => {
    // Simulated load from the API layer
    async function loadData() {
      try {
        const [sum, custs, churnDist, riskDist, ltvTr, contractCh, cohorts] =
          await Promise.all([
            apiClient.getMetricsSummary(),
            apiClient.getCustomers(),
            apiClient.getChurnDistribution(),
            apiClient.getRiskDistribution(),
            apiClient.getLtvTrends(),
            apiClient.getContractChurn(),
            apiClient.getLtvCohorts(),
          ]);

        setSummary(sum);
        setCustomers(custs);
        setChurnDistribution(churnDist);
        setRiskDistribution(riskDist);
        setLtvTrends(ltvTr);
        setContractChurn(contractCh);
        setLtvCohorts(cohorts);
      } catch (err) {
        console.error("Failed to load dashboard data from API client:", err);
      }
    }
    loadData();
  }, []);

  const tabMetadata: Record<NavTab, { title: string; description: string }> = {
    overview: {
      title: "Dashboard Overview",
      description:
        "High-level telemetry on customer retention, projected lifetime value, and accounts at risk",
    },
    churn: {
      title: "Churn Analysis",
      description:
        "Machine learning churn probabilities, risk segmentations, and predictive feature attributions",
    },
    ltv: {
      title: "Customer Lifetime Value (LTV)",
      description:
        "Long-term value trajectories, cohort progressions, and enterprise account growth",
    },
    customers: {
      title: "Customers Directory",
      description:
        "Full customer portfolio with ML churn scores, estimated value, and actionable retention playbooks",
    },
    settings: {
      title: "System Settings",
      description:
        "Tune ML classification cutoffs, configure FastAPI service connection, and manage alert webhooks",
    },
  };

  const currentMeta = tabMetadata[currentTab];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNav
          title={currentMeta.title}
          description={currentMeta.description}
          customers={customers}
          onSelectCustomer={(c) => setSelectedCustomer(c)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === "overview" && (
            <OverviewView
              summary={summary}
              customers={customers}
              churnDistribution={churnDistribution}
              riskDistribution={riskDistribution}
              ltvTrends={ltvTrends}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === "churn" && (
            <ChurnAnalysisView
              customers={customers}
              churnDistribution={churnDistribution}
              contractChurn={contractChurn}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
          )}

          {currentTab === "ltv" && (
            <LtvAnalysisView
              customers={customers}
              ltvTrends={ltvTrends}
              ltvCohorts={ltvCohorts}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
          )}

          {currentTab === "customers" && (
            <CustomersView
              customers={customers}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
          )}

          {currentTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Slide-over Customer Detail Dossier Drawer */}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
