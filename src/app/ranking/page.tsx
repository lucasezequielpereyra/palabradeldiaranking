"use client";

import { useState, useEffect } from "react";
import RankingTable from "@/components/RankingTable";
import RankingChart from "@/components/RankingChart";

const tabs = [
  { key: "daily", label: "Hoy" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
  { key: "historical", label: "Histórico" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("daily");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rankings?type=${activeTab}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-teal-400">Rankings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-teal-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando rankings...</div>
      ) : (
        <div className="space-y-6">
          <RankingChart
            data={data}
            type={activeTab === "daily" ? "daily" : "aggregate"}
          />
          <RankingTable data={data} type={activeTab} />
        </div>
      )}
    </div>
  );
}
