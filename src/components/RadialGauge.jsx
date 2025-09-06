import React from "react";
const RadialGauge = ({ value=0, max=100, label="", suffix="" }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const size=92, stroke=10, r=(size-stroke)/2, c=2*Math.PI*r, dash=c*pct;
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r}
          stroke="#60a5fa" strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#e5e7eb">
          {value.toFixed(1)}{suffix}
        </text>
      </svg>
      <div className="text-sm text-slate-300/90">{label}</div>
    </div>
  );
};
export default RadialGauge;
