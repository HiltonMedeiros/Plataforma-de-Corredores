import { Trophy, MapPin, Crown } from "lucide-react";
import { ranking } from "@/data/mockData";

export function RankingSection() {
  return (
    <section className="card-fitness p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Ranking</h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>Centro</span>
        </div>
      </div>

      <div className="space-y-2">
        {ranking.map((item) => (
          <div
            key={item.pos}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-150 ${
              item.isUser
                ? "bg-accent border border-primary/20"
                : "hover:bg-muted/50"
            }`}
          >
            {/* Position */}
            <div className="w-7 h-7 flex items-center justify-center">
              {item.pos === 1 ? (
                <Crown className="w-5 h-5 text-gold" />
              ) : (
                <span
                  className={`text-sm font-bold font-display ${
                    item.pos === 2
                      ? "text-silver"
                      : item.pos === 3
                      ? "text-bronze"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.pos}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                item.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {item.avatar}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  item.isUser ? "text-primary font-semibold" : "text-foreground"
                }`}
              >
                {item.name}
                {item.isUser && (
                  <span className="ml-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    Você
                  </span>
                )}
              </p>
            </div>

            {/* Badge + KM */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-base">{item.badge}</span>
              <span className="text-sm font-bold font-display text-foreground">
                {item.km}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">km</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
