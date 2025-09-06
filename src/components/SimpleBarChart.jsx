import React from "react";
const SimpleBarChart = ({ categories=[], values=[], height=180, valueSuffix="" }) => {
  const width=600, padX=24, padY=16, innerW=width-padX*2, innerH=height-padY*2;
  const maxV=Math.max(1, ...values);
  const bw=innerW/((categories.length||1)*1.5), gap=bw/2;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />
      {values.map((v,i)=>{
        const h=(v/maxV)*innerH, x=padX+i*(bw+gap), y=height-padY-h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} rx="6" fill="#7dd3fc" opacity="0.9" />
            <text x={x+bw/2} y={y-6} textAnchor="middle" fill="#e5e7eb" fontSize="11">{v.toFixed(1)}{valueSuffix}</text>
            <text x={x+bw/2} y={height-2} textAnchor="middle" fill="#94a3b8" fontSize="11">{categories[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};
export default SimpleBarChart;
