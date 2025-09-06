import React from "react";

const SectionCard = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl p-6 border shadow-lg ${className}`}
      style={{
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {children}
    </div>
  );
};

export default SectionCard;
