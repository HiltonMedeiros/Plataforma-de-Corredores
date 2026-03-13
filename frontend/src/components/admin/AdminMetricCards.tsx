import { Users, UserCheck, TrendingUp, UserPlus } from "lucide-react";
import { adminMetrics } from "@/data/adminMockData";

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  color: string;
  bg: string;
};

function MetricCard({ icon, label, value, trend, trendPositive, color, bg }: MetricCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col gap-3" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trendPositive
              ? "text-emerald-700 bg-emerald-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {trendPositive ? "+" : ""}{trend}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground font-display tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function AdminMetricCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        icon={<Users className="w-5 h-5" />}
        label="Total de Usuários"
        value={adminMetrics.totalUsers.toLocaleString("pt-BR")}
        trend={`${adminMetrics.totalUsersGrowth}% vs mês anterior`}
        trendPositive
        color="hsl(221 83% 53%)"
        bg="hsl(221 83% 53% / 0.1)"
      />
      <MetricCard
        icon={<UserCheck className="w-5 h-5" />}
        label="Ativos (30 dias)"
        value={adminMetrics.activeUsers.toLocaleString("pt-BR")}
        trend={`${adminMetrics.activeUsersGrowth}% vs mês anterior`}
        trendPositive
        color="hsl(152 72% 36%)"
        bg="hsl(152 72% 36% / 0.1)"
      />
      <MetricCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="KM Totais Acumulados"
        value={`${adminMetrics.totalKm.toLocaleString("pt-BR")} km`}
        trend={`${adminMetrics.totalKmGrowth}% vs mês anterior`}
        trendPositive
        color="hsl(43 96% 45%)"
        bg="hsl(43 96% 52% / 0.1)"
      />
      <MetricCard
        icon={<UserPlus className="w-5 h-5" />}
        label="Novos Cadastros Hoje"
        value={adminMetrics.newToday.toString()}
        trend={`+${adminMetrics.newTodayDelta} hoje`}
        trendPositive
        color="hsl(280 70% 55%)"
        bg="hsl(280 70% 55% / 0.1)"
      />
    </div>
  );
}
