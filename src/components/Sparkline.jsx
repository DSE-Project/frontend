import React, { useMemo } from "react";
function pathFromData(data, width, height, padding = 6) {
  if (!data?.length) return "";
  const minY = Math.min(...data), maxY = Math.max(...data), rangeY = maxY - minY || 1;
  const innerW = width - padding*2, innerH = height - padding*2;
  const pts = data.map((y,i)=>{
    const x = padding + (i/(data.length-1))*innerW;
    const ny = (y - minY) / rangeY;
    const yy = padding + (1 - ny) * innerH;
    return [x,yy];
  });
  return pts.map(([x,y],i)=> i===0?`M ${x} ${y}`:`L ${x} ${y}`).join(" ");
}
const Sparkline = ({ data=[], width="100%", height=60, color="#34d399", showGradient=false }) => {
  const vw = 400; const d = useMemo(()=>pathFromData(data, vw, height), [data, height]);
  return (
    <svg viewBox={`0 0 ${vw} ${height}`} width={width} height={height} preserveAspectRatio="none">
      {showGradient && (
        <>
          <defs>
            <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L ${vw} ${height} L 0 ${height} Z`} fill="url(#sparkGrad)" />
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};
export default Sparkline;
