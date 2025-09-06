import React from "react";
import SectionCard from "./SectionCard";
import Sparkline from "./Sparkline";

const KpiCard = ({ title, value, suffix="%", trend=[], color="#60a5fa" }) => (
  <SectionCard>
    <div className="text-sm text-slate-400">{title}</div>
    <div className="mt-1 text-2xl font-bold tracking-tight">
      {typeof value === "number" ? value.toFixed(1) : value}{suffix}
    </div>
    <div className="mt-3">
      <Sparkline data={trend} height={54} color={color} showGradient />
    </div>
  </SectionCard>
);
export default KpiCard;
