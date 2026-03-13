import { useState } from "react";
import { Menu, Bell, Download, Search, Sun, Moon } from "lucide-react";

const periods = ["Hoje", "Semana", "Mês", "Customizado"] as const;
type Period = (typeof periods)[number];

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const [period, setPeriod] = useState<Period>("Mês");
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b"
      style={{
        background: "hsl(0 0% 100%)",
        borderColor: "hsl(214 20% 90%)",
        boxShadow: "0 1px 4px hsl(220 25% 12% / 0.06)",
      }}
    >
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar usuários, atividades..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
          style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.4)" } as React.CSSProperties}
        />
      </div>

      {/* Period selector */}
      <div className="hidden sm:flex items-center gap-1 bg-muted rounded-xl p-1">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              period === p
                ? "text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={period === p ? { background: "hsl(221 83% 53%)" } : {}}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
          <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          <span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white text-[8px] flex items-center justify-center font-bold text-white"
            style={{ background: "hsl(221 83% 53%)" }}
          >
            <span className="sr-only">3 notificações</span>
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Alternar tema"
        >
          {dark ? (
            <Sun className="w-4.5 h-4.5 text-muted-foreground" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-muted-foreground" />
          )}
        </button>

        {/* Export */}
        <button
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "hsl(221 83% 53%)" }}
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>
    </header>
  );
}
