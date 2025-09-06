import React from "react";
import Header from "../components/Header";
import HeroLanding from "../components/HeroLanding";
import SectionCard from "../components/SectionCard";
import KpiCard from "../components/KpiCard";
import { homeKpis, homeSellingPoints } from "../utils/dummyData";

const HomePage = ({ user }) => {
  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200">
      <Header user={user} />
      <HeroLanding bgUrl="src/assets/hero_city.jpg" />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-10">
        

        {/* Keep the rest exactly like before */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {homeKpis.map((k) => (
            <KpiCard key={k.title} {...k} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {homeSellingPoints.map((s) => (
            <SectionCard key={s.title}>
              <div className="text-lg font-semibold">{s.title}</div>
              <p className="mt-2 text-slate-300/90">{s.body}</p>
            </SectionCard>
          ))}
        </div>

        <SectionCard>
          <div className="text-sm text-slate-400">
            These sections use dummy data for now — wire your API later with minimal changes.
          </div>
        </SectionCard>
      </main>
    </div>
  );
};

export default HomePage;
