import { useState } from "react";
import { Check, X, AlertTriangle, Clock } from "lucide-react";
import { pendingActivities, PendingActivity } from "@/data/adminMockData";

export function AdminPendingActivities() {
  const [activities, setActivities] = useState(pendingActivities);

  const approve = (id: number) => setActivities((prev) => prev.filter((a) => a.id !== id));
  const reject = (id: number) => setActivities((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground">Atividades Pendentes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Moderação e aprovação</p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ background: "hsl(221 83% 53%)" }}
        >
          {activities.length} pendentes
        </span>
      </div>

      <div className="divide-y divide-border/40">
        {activities.length === 0 && (
          <div className="px-5 py-8 text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-2">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma atividade pendente!</p>
          </div>
        )}

        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onApprove={() => approve(activity.id)}
            onReject={() => reject(activity.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  onApprove,
  onReject,
}: {
  activity: PendingActivity;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className={`px-5 py-4 flex items-center gap-3 transition-colors hover:bg-muted/20 ${
        activity.suspicious ? "" : ""
      }`}
      style={activity.suspicious ? { background: "hsl(43 96% 52% / 0.06)" } : {}}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: activity.suspicious ? "hsl(43 96% 45%)" : "hsl(221 83% 53%)" }}
      >
        {activity.userAvatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{activity.userName}</p>
          {activity.suspicious && (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Suspeito
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground capitalize">{activity.type === "corrida" ? "🏃 Corrida" : "🚶 Caminhada"}</span>
          <span className="text-xs font-semibold" style={{ color: activity.suspicious ? "hsl(43 96% 45%)" : "hsl(221 83% 53%)" }}>
            {activity.km} km
          </span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {activity.date}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onApprove}
          title="Aprovar"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "hsl(152 72% 36%)" }}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onReject}
          title="Rejeitar"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "hsl(0 84% 60%)" }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
