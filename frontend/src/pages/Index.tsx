import { useState } from "react";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICards } from "@/components/dashboard/KPICards";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ActivitiesHistory } from "@/components/dashboard/ActivitiesHistory";
import { MedalsSection } from "@/components/dashboard/MedalsSection";
import { RankingSection } from "@/components/dashboard/RankingSection";
import { RegisterActivityModal } from "@/components/dashboard/RegisterActivityModal";
import { BottomNav } from "@/components/BottomNav";
import { currentUser } from "@/data/mockData";
import avatarImg from "@/assets/avatar.jpg";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader onRegister={() => setModalOpen(true)} />

      {/* User greeting strip */}
      <div
        className="px-4 pb-5 pt-4"
        style={{ background: "hsl(var(--secondary))" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarImg}
            alt={currentUser.name}
            className="w-12 h-12 rounded-2xl border-2 border-primary/50 object-cover"
          />
          <div>
            <p className="text-white/70 text-xs font-medium">Olá de volta! 👋</p>
            <h1 className="font-display text-white font-bold text-lg leading-tight">
              {currentUser.name}
            </h1>
            <p className="text-white/60 text-xs">
              📍 {currentUser.neighborhood} · {currentUser.activeDays} dias ativos
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pb-24 space-y-4 max-w-lg mx-auto pt-4">
        {/* KPI Cards */}
        <div className="animate-slide-up">
          <KPICards onRegister={() => setModalOpen(true)} />
        </div>

        {/* Performance Chart */}
        <div className="animate-slide-up delay-100">
          <PerformanceChart />
        </div>

        {/* Medals */}
        <div className="animate-slide-up delay-200">
          <MedalsSection earnedKm={currentUser.totalKmMonth} />
        </div>

        {/* Ranking */}
        <div className="animate-slide-up delay-300">
          <RankingSection />
        </div>

        {/* Activities */}
        <div className="animate-slide-up delay-400">
          <ActivitiesHistory />
        </div>
      </main>

      {/* FAB - positioned above BottomNav */}
      <button
        onClick={() => setModalOpen(true)}
        className="pulse-glow fixed z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: "var(--gradient-hero)",
          boxShadow: "var(--shadow-primary)",
          bottom: "calc(env(safe-area-inset-bottom) + 5rem)",
          right: "1.5rem",
        }}
        aria-label="Registrar nova atividade"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Nav */}
      <BottomNav />

      {/* Modal */}
      <RegisterActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Index;
