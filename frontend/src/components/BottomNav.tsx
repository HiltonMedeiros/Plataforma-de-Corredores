import { Home, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-6 py-2 border-t border-border/60"
      style={{
        background: "hsl(var(--card))",
        backdropFilter: "blur(12px)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all duration-200 active:scale-95",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200",
                active ? "bg-accent" : "bg-transparent"
              )}
            >
              <Icon
                className={cn("w-5 h-5 transition-all duration-200", active ? "stroke-[2.5]" : "stroke-2")}
              />
            </div>
            <span className={cn("text-[10px] font-medium transition-all", active ? "font-semibold" : "")}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
