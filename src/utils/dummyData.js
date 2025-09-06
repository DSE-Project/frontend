const clamp01 = (x) => Math.max(0, Math.min(1, x));
const rand = (min, max) => Math.random() * (max - min) + min;
const series = (n, start=0.25, jitter=0.08) =>
  Array.from({length: n}, (_, i) => clamp01(start + rand(-jitter, jitter) + (i-n/2)*0.001));

// Home KPIs (hero area)
export const homeKpis = [
  { title: "1m Probability", value: 41.3, suffix: "%", trend: series(24, 0.42), color: "#f59e0b" },
  { title: "3m Probability", value: 14.5, suffix: "%", trend: series(24, 0.15), color: "#22c55e" },
  { title: "6m Probability", value: 8.1,  suffix: "%", trend: series(24, 0.09), color: "#60a5fa" },
];

export const homeSellingPoints = [
  { title: "Glassy & fast", body: "Dark glass design with instant feedback and clean visual language." },
  { title: "Model-ready", body: "Drop in your API later without rewriting components." },
  { title: "Light charts", body: "Pure SVG sparklines and bars — no heavy chart libs required." },
];

// Dashboard KPIs
export const dashKpis = [
  { title: "1m Probability", value: 41.3, trend: series(24, 0.42), color: "#f59e0b" },
  { title: "3m Probability", value: 14.5, trend: series(24, 0.15), color: "#22c55e" },
  { title: "6m Probability", value: 8.1,  trend: series(24, 0.09), color: "#60a5fa" },
];

// Overview bar (% values as 0..1, converted to % in chart)
export const horizonBar = {
  categories: ["1 Month", "3 Months", "6 Months"],
  values: [0.413, 0.145, 0.081],
};

// Horizon trends (0..1)
export const trend1m = series(24, 0.42);
export const trend3m = series(24, 0.15);
export const trend6m = series(24, 0.09);

// Indicator snapshots
export const indicatorsNow = { unemployment: 4.1, inflation: -1.2, fedFunds: 5.0 };

// Indicator histories
export const indicatorsTrend = {
  unemployment: Array.from({length:24}, (_,i)=> 3.6 + Math.sin(i/3)*0.3 + rand(-0.05,0.05)),
  inflation:    Array.from({length:24}, (_,i)=> 2.5 + Math.cos(i/4)*0.8 + rand(-0.1,0.1)),
  fedFunds:     Array.from({length:24}, (_,i)=> 4.0 + Math.sin(i/5)*0.6 + rand(-0.05,0.05)),
};
