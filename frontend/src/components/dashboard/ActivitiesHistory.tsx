import { Activity, Clock, Check, Hourglass, Eye, PersonStanding } from "lucide-react";
import { activities } from "@/data/mockData";

export function ActivitiesHistory() {
  return (
    <section className="card-fitness p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Histórico</h2>
        </div>
        <span className="text-xs text-muted-foreground">{activities.length} atividades</span>
      </div>

      <div className="space-y-1">
        {activities.map((act) => (
          <div key={act.id} className="activity-row">
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                act.type === "corrida"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {act.type === "corrida" ? (
                <span className="text-lg">🏃</span>
              ) : (
                <span className="text-lg">🚶</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground capitalize">{act.type}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {act.time}
                </span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-xs text-muted-foreground">{act.date}</span>
              </div>
            </div>

            {/* Distance */}
            <div className="text-right shrink-0">
              <p className="text-sm font-bold font-display text-foreground">
                {act.distance}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">km</span>
              </p>
            </div>

            {/* Status */}
            <div className="shrink-0">
              {act.status === "aprovado" ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-accent px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  OK
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-gold bg-accent/80 px-2 py-1 rounded-full">
                  <Hourglass className="w-3 h-3" />
                  Análise
                </span>
              )}
            </div>

            {/* Proof */}
            {act.proof && (
              <button className="shrink-0 w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
