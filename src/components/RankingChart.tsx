"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartEntry {
  nickname: string;
  points: number;
  totalPoints?: number;
}

interface RankingChartProps {
  data: ChartEntry[];
  type: "daily" | "aggregate";
}

export default function RankingChart({ data, type }: RankingChartProps) {
  const chartData = data.slice(0, 10).map((d) => ({
    name: d.nickname,
    puntos: type === "daily" ? d.points : d.totalPoints ?? d.points,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
          />
          <Bar dataKey="puntos" fill="#14b8a6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
