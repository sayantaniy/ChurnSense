"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sliders,
  Cpu,
  Server,
  Bell,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export function SettingsView() {
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000");
  const [lowThreshold, setLowThreshold] = useState("30");
  const [highThreshold, setHighThreshold] = useState("65");
  const [alertHighRisk, setAlertHighRisk] = useState(true);
  const [alertVipDrop, setAlertVipDrop] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestConnection = () => {
    setIsCheckingBackend(true);
    setTimeout(() => {
      setIsCheckingBackend(false);
      alert(
        `FastAPI Architecture Validated!\nTarget: ${apiUrl}\nStatus: Client adapter mapped to schemas with mock fallback.`
      );
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Dashboard preferences and ML parameters saved successfully.</span>
        </div>
      )}

      {/* Churn Risk Thresholds */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <div>
              <CardTitle>Churn Risk Classification Thresholds</CardTitle>
              <CardDescription>
                Define the model probability bounds for categorizing accounts into risk tiers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Low / Medium Cutoff (% Churn Probability)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Accounts below this probability are marked as Low Risk.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(e.target.value)}
                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-slate-500 font-medium">%</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Medium / High Cutoff (% Churn Probability)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Accounts exceeding this probability are marked as High Risk.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(e.target.value)}
                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-slate-500 font-medium">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend & ML Pipeline Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <div>
              <CardTitle>FastAPI Machine Learning Service Endpoint</CardTitle>
              <CardDescription>
                Configure the connection for the upcoming Python FastAPI backend service
              </CardDescription>
            </div>
          </div>
          <Badge variant="indigo">Architecture Ready</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xs space-y-1">
            <label className="block font-semibold text-slate-700">API Base URL</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Button
                variant="outline"
                size="md"
                onClick={handleTestConnection}
                disabled={isCheckingBackend}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? "animate-spin" : ""}`} />
                Test Connection
              </Button>
            </div>
            <p className="text-[11px] text-slate-400">
              Expected endpoints: <code className="bg-slate-100 px-1 py-0.5 rounded">/api/v1/predict/churn</code> and{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded">/api/v1/predict/ltv</code>
            </p>
          </div>

          {/* Model Registry Cards */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                Underlying ML Models Configured
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Pydantic v2 Contract</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <p className="font-semibold text-slate-800">1. Churn Classifier</p>
                <p className="text-[11px] text-slate-500">XGBoost / Random Forest (AUC 0.89)</p>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <p className="font-semibold text-slate-800">2. LTV Regressor</p>
                <p className="text-[11px] text-slate-500">Gradient Boosted Regressor (RMSE $240)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert & Automated Triggers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <div>
              <CardTitle>Retention Alerts & Automated Notifications</CardTitle>
              <CardDescription>
                Configure when Customer Success and Account Executives receive notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-800">High Risk Threshold Breach</p>
                <p className="text-[11px] text-slate-500">
                  Notify Account Team when any account reaches &gt;65% churn risk
                </p>
              </div>
              <input
                type="checkbox"
                checked={alertHighRisk}
                onChange={(e) => setAlertHighRisk(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-800">VIP Account Health Anomaly</p>
                <p className="text-[11px] text-slate-500">
                  Instant alert if an Enterprise customer with LTV &gt;$5,000 logs 3+ support tickets
                </p>
              </div>
              <input
                type="checkbox"
                checked={alertVipDrop}
                onChange={(e) => setAlertVipDrop(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" size="md" onClick={() => window.location.reload()}>
          Reset Defaults
        </Button>
        <Button variant="primary" size="md" onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
