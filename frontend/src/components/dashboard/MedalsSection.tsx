import { Trophy, Medal } from "lucide-react";

interface MedalsSectionProps {
  earnedKm: number;
}

const medals = [
  {
    level: "Bronze",
    km: 5,
    emoji: "🥉",
    gradient: "var(--gradient-bronze)",
    shadow: "0 4px 16px hsl(25 70% 52% / 0.4)",
    desc: "5 km",
  },
  {
    level: "Prata",
    km: 10,
    emoji: "🥈",
    gradient: "var(--gradient-silver)",
    shadow: "0 4px 16px hsl(220 15% 65% / 0.4)",
    desc: "10 km",
  },
  {
    level: "Ouro",
    km: 21,
    emoji: "🥇",
    gradient: "var(--gradient-gold)",
    shadow: "0 4px 16px hsl(43 96% 52% / 0.4)",
    desc: "21 km",
  },
  {
    level: "Diamante",
    km: 42,
    emoji: "💎",
    gradient: "var(--gradient-diamond)",
    shadow: "0 4px 16px hsl(220 90% 60% / 0.4)",
    desc: "42 km",
  },
];

export function MedalsSection({ earnedKm }: MedalsSectionProps) {
  return (
    <section className="card-fitness p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-foreground">Medalhas</h2>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {medals.map((medal) => {
          const earned = earnedKm >= medal.km;
          return (
            <div
              key={medal.level}
              className={earned ? "medal-card-active" : "medal-card-locked"}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
                style={
                  earned
                    ? { background: medal.gradient, boxShadow: medal.shadow }
                    : { background: "hsl(var(--muted))" }
                }
              >
                <span>{medal.emoji}</span>
                {earned && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">✓</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">
                {medal.level}
              </span>
              <span className="text-[10px] text-muted-foreground">{medal.desc}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-accent/60 flex items-center gap-3">
        <Medal className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs text-accent-foreground font-medium">
          Conquiste Bronze (5km), Prata (10km), Ouro (21km) e Diamante (42km) mensalmente!
        </p>
      </div>
    </section>
  );
}
