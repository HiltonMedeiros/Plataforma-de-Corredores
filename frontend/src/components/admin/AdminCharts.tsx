import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { userGrowthData, activityByNeighborhood, levelDistribution } from "@/data/adminMockData";

// ── User Growth Line Chart ─────────────────────────────────────────────────
export function UserGrowthChart() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
      <h3 className="font-display font-semibold text-foreground mb-4">Evolução de Usuários</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215 15% 52%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(215 15% 52%)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(214 20% 90%)", borderRadius: "12px", boxShadow: "0 4px 12px hsl(220 25% 12% / 0.1)" }}
            labelStyle={{ fontWeight: 600, color: "hsl(220 25% 12%)" }}
          />
          <Line
            type="monotone"
            dataKey="users"
            name="Usuários"
            stroke="hsl(221 83% 53%)"
            strokeWidth={2.5}
            dot={{ fill: "hsl(221 83% 53%)", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Activity by Neighborhood Horizontal Bar ────────────────────────────────
export function ActivityByNeighborhoodChart() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
      <h3 className="font-display font-semibold text-foreground mb-4">Atividade por Bairro</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={activityByNeighborhood} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214 20% 90%)" />
          <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(215 15% 52%)" }} axisLine={false} tickLine={false} />
          <YAxis dataKey="neighborhood" type="category" tick={{ fontSize: 12, fill: "hsl(215 15% 52%)" }} axisLine={false} tickLine={false} width={50} />
          <Tooltip
            contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(214 20% 90%)", borderRadius: "12px", boxShadow: "0 4px 12px hsl(220 25% 12% / 0.1)" }}
          />
          <Bar dataKey="count" name="Atividades" fill="hsl(221 83% 53%)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Level Distribution Pie ─────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function LevelDistributionChart() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
      <h3 className="font-display font-semibold text-foreground mb-4">Distribuição por Nível</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={levelDistribution}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {levelDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 11, color: "hsl(215 15% 52%)" }}>{value}</span>}
          />
          <Tooltip
            contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(214 20% 90%)", borderRadius: "12px", boxShadow: "0 4px 12px hsl(220 25% 12% / 0.1)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
