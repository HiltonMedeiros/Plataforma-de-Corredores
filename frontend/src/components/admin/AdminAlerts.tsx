import { AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";
import { systemAlerts } from "@/data/adminMockData";

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bg: "hsl(43 96% 52% / 0.08)",
    border: "hsl(43 96% 52% / 0.3)",
    iconColor: "hsl(43 96% 40%)",
    badgeBg: "hsl(43 96% 52% / 0.15)",
    badgeText: "hsl(43 96% 35%)",
    label: "Atenção",
  },
  success: {
    icon: CheckCircle,
    bg: "hsl(152 72% 36% / 0.06)",
    border: "hsl(152 72% 36% / 0.25)",
    iconColor: "hsl(152 72% 36%)",
    badgeBg: "hsl(152 72% 36% / 0.12)",
    badgeText: "hsl(152 72% 28%)",
    label: "OK",
  },
  info: {
    icon: Info,
    bg: "hsl(221 83% 53% / 0.06)",
    border: "hsl(221 83% 53% / 0.2)",
    iconColor: "hsl(221 83% 53%)",
    badgeBg: "hsl(221 83% 53% / 0.12)",
    badgeText: "hsl(221 83% 45%)",
    label: "Info",
  },
};

export function AdminAlerts() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="font-display font-semibold text-foreground">Alertas do Sistema</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Monitoramento em tempo real</p>
      </div>

      <div className="p-4 space-y-3">
        {systemAlerts.map((alert) => {
          const cfg = alertConfig[alert.type];
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3.5 rounded-xl border"
              style={{ background: cfg.bg, borderColor: cfg.border }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: cfg.badgeBg }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">{alert.message}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </div>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: cfg.badgeBg, color: cfg.badgeText }}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
