import { useState, useEffect } from "react";
import { currentUser, goals } from "@/data/mockData";

interface KPICardsProps {
  onRegister: () => void;
}

export function KPICards({ onRegister }: KPICardsProps) {
  const { totalKmMonth, goalKm, goalLevel } = currentUser;
  const progressPercent = Math.min((totalKmMonth / goalKm) * 100, 100);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedKm, setAnimatedKm] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = totalKmMonth / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= totalKmMonth) {
        setAnimatedKm(totalKmMonth);
        clearInterval(interval);
      } else {
        setAnimatedKm(parseFloat(current.toFixed(1)));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [totalKmMonth]);

  const currentGoalIndex = goals.findIndex((g) => g.level === goalLevel);
  const prevGoal = currentGoalIndex > 0 ? goals[currentGoalIndex - 1] : null;
  const currentGoalObj = goals[currentGoalIndex];

  return (
    <div className="space-y-4">
      {/* Main KM card */}
      <div
        className="rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-primary)" }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-10 -translate-x-8" />

        <div className="relative">
          <p className="text-primary-foreground/80 text-sm font-medium mb-1">
            Km acumulados em março
          </p>
          <div className="flex items-end gap-2 mb-4">
            <span className="stat-number text-5xl font-black text-primary-foreground leading-none">
              {animatedKm.toFixed(1)}
            </span>
            <span className="text-primary-foreground/80 text-lg font-medium mb-1">km</span>
          </div>

          {/* Progress bar */}
          <div className="progress-bar bg-white/20 mb-3">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out bg-white"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {prevGoal && (
                <span className="text-xs text-primary-foreground/70">
                  {prevGoal.km}km
                </span>
              )}
              <span className="text-xs font-semibold text-primary-foreground/90">
                {animatedProgress.toFixed(0)}% da meta
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              <span className="text-base">{currentGoalObj?.emoji}</span>
              <span className="text-xs font-bold text-primary-foreground">
                Meta {goalLevel} · {goalKm}km
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-fitness p-4 text-center">
          <p className="stat-number text-2xl font-bold text-foreground">
            {currentUser.activeDays}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
            Dias ativos
          </p>
        </div>
        <div className="card-fitness p-4 text-center">
          <p className="stat-number text-2xl font-bold text-foreground">
            {currentUser.totalActivities}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
            Atividades
          </p>
        </div>
        <div className="card-fitness p-4 text-center">
          <p className="stat-number text-2xl font-bold text-foreground">
            #{currentUser.rank}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
            Ranking
          </p>
        </div>
      </div>

      {/* Goals mini strip */}
      <div className="card-fitness p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Níveis da Meta
        </p>
        <div className="relative">
          {/* Track */}
          <div className="h-2 bg-muted rounded-full mb-3" />
          {/* Filled */}
          <div
            className="h-2 rounded-full absolute top-0 left-0 transition-all duration-1000"
            style={{
              background: "var(--gradient-hero)",
              width: `${(totalKmMonth / 42) * 100}%`,
              maxWidth: "100%",
            }}
          />
          {/* Milestones */}
          <div className="flex justify-between mt-1">
            {goals.map((g) => {
              const pos = (g.km / 42) * 100;
              const earned = totalKmMonth >= g.km;
              return (
                <div key={g.level} className="flex flex-col items-center gap-1">
                  <span className={`text-base ${earned ? "" : "grayscale opacity-40"}`}>
                    {g.emoji}
                  </span>
                  <span className={`text-[9px] font-bold ${earned ? "text-primary" : "text-muted-foreground"}`}>
                    {g.km}km
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
