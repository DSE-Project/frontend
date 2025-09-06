import React from "react";
import Header from "../components/Header";
import SectionCard from "../components/SectionCard";
import KpiCard from "../components/KpiCard";
import SimpleBarChart from "../components/SimpleBarChart";
import Sparkline from "../components/Sparkline";
import RadialGauge from "../components/RadialGauge";
import {
  dashKpis,
  horizonBar,
  trend1m,
  trend3m,
  trend6m,
  indicatorsNow,
  indicatorsTrend,
} from "../utils/dummyData";

const DashBoard = ({ user }) => {
  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200">
      <Header user={user} />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashKpis.map((k) => <KpiCard key={k.title} {...k} />)}
        </div>

        {/* Overview bar */}
        <SectionCard>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-xl font-semibold">Recession Probability Overview</h3>
            <span className="text-xs text-slate-400">Dummy data</span>
          </div>
          <SimpleBarChart
            categories={horizonBar.categories}
            values={horizonBar.values.map((v) => v * 100)}
            valueSuffix="%"
            height={180}
          />
        </SectionCard>

        {/* Trends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionCard>
            <div className="flex items-center justify-between">
              <div className="font-semibold">1 Month Trend</div>
              <span className="text-xs text-slate-400">last 24</span>
            </div>
            <div className="mt-3"><Sparkline data={trend1m} height={80} showGradient /></div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between">
              <div className="font-semibold">3 Months Trend</div>
              <span className="text-xs text-slate-400">last 24</span>
            </div>
            <div className="mt-3"><Sparkline data={trend3m} height={80} color="#22c55e" showGradient /></div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between">
              <div className="font-semibold">6 Months Trend</div>
              <span className="text-xs text-slate-400">last 24</span>
            </div>
            <div className="mt-3"><Sparkline data={trend6m} height={80} color="#f59e0b" showGradient /></div>
          </SectionCard>
        </div>

        {/* Indicators */}
        <SectionCard>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold">Key Economic Indicators</h3>
            <span className="text-xs text-slate-400">Dummy data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <RadialGauge value={indicatorsNow.unemployment} max={20} label="Unemployment" suffix="%" />
              <div className="flex-1">
                <div className="text-sm text-slate-300/90 mb-2">Last 24</div>
                <Sparkline data={indicatorsTrend.unemployment} height={60} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <RadialGauge value={indicatorsNow.inflation} max={20} label="Inflation (CPI YoY)" suffix="%" />
              <div className="flex-1">
                <div className="text-sm text-slate-300/90 mb-2">Last 24</div>
                <Sparkline data={indicatorsTrend.inflation} height={60} color="#eab308" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <RadialGauge value={indicatorsNow.fedFunds} max={20} label="Fed Funds Rate" suffix="%" />
              <div className="flex-1">
                <div className="text-sm text-slate-300/90 mb-2">Last 24</div>
                <Sparkline data={indicatorsTrend.fedFunds} height={60} color="#60a5fa" />
              </div>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
};

export default DashBoard;
