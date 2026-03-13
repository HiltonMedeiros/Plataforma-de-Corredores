import { Bell, Plus } from "lucide-react";
import avatarImg from "@/assets/avatar.jpg";
import { currentUser } from "@/data/mockData";

interface DashboardHeaderProps {
  onRegister: () => void;
}

export function DashboardHeader({ onRegister }: DashboardHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
      style={{
        background: "hsl(var(--secondary))",
      }}
    >
      {/* Left: Logo + Month */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🏃</span>
          <span className="font-display font-bold text-white text-sm leading-tight">
            Bayeux em<br />
            <span className="text-primary-light">Movimento</span>
          </span>
        </div>
      </div>

      {/* Center: Month pill */}
      <div className="bg-white/10 px-3 py-1.5 rounded-full">
        <span className="text-xs font-semibold text-white/90">Março 2026</span>
      </div>

      {/* Right: Register + Avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRegister}
          className="flex items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full hover:bg-primary-light transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white hidden sm:block">Registrar</span>
        </button>
        <div className="relative">
          <img
            src={avatarImg}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full border-2 border-primary object-cover"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-secondary" />
        </div>
      </div>
    </header>
  );
}
