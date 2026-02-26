"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface StatsChartProps {
  distribution: number[];
  recentResults: { gameNumber: number; points: number }[];
}

export default function StatsChart({ distribution, recentResults }: StatsChartProps) {
  const distData = [
    { name: "X", cantidad: distribution[0] },
    { name: "1", cantidad: distribution[1] },
    { name: "2", cantidad: distribution[2] },
    { name: "3", cantidad: distribution[3] },
    { name: "4", cantidad: distribution[4] },
    { name: "5", cantidad: distribution[5] },
    { name: "6", cantidad: distribution[6] },
  ];

  const progressData = [...recentResults].reverse().map((r) => ({
    juego: `#${r.gameNumber}`,
    puntos: r.points,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Distribución de intentos</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={distData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Bar dataKey="cantidad" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {progressData.length > 1 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Progreso reciente</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="juego" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[0, 6]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
              />
              <Line type="monotone" dataKey="puntos" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
