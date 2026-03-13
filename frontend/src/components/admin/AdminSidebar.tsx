import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Activity,
  Award,
  Settings,
  FileBarChart2,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Usuários", icon: Users, href: "/admin/usuarios" },
  { label: "Atividades", icon: Activity, href: "/admin/atividades" },
  { label: "Medalhas", icon: Award, href: "/admin/medalhas" },
  { label: "Relatórios", icon: FileBarChart2, href: "/admin/relatorios" },
  { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "hsl(222 47% 14%)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: "hsl(222 40% 20%)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold text-white"
              style={{ background: "hsl(221 83% 53%)" }}
            >
              B
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none font-display">Bayeux</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(221 83% 70%)" }}>Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active = location.pathname === href || (href !== "/admin" && location.pathname.startsWith(href));
            return (
              <NavLink
                key={href}
                to={href}
                end={href === "/admin"}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? "text-white"
                    : "text-white/55 hover:text-white/80 hover:bg-white/5"
                  }
                `}
                style={active ? { background: "hsl(221 83% 53%)" } : {}}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin profile footer */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "hsl(222 40% 20%)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: "hsl(221 83% 45%)" }}
            >
              RL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate leading-none mb-0.5">Roberta Lima</p>
              <p className="text-xs truncate" style={{ color: "hsl(221 83% 70%)" }}>Administradora</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
