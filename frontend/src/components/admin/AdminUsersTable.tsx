import { useState } from "react";
import { Search, Eye, Pencil, Ban, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { adminUsers, AdminUser } from "@/data/adminMockData";

const ITEMS_PER_PAGE = 5;

const statusStyles: Record<AdminUser["status"], string> = {
  ativo: "bg-emerald-50 text-emerald-700",
  inativo: "bg-gray-100 text-gray-500",
  bloqueado: "bg-red-50 text-red-600",
};

const statusLabel: Record<AdminUser["status"], string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  bloqueado: "Bloqueado",
};

export function AdminUsersTable() {
  const [search, setSearch] = useState("");
  const [filterNeighborhood, setFilterNeighborhood] = useState("todos");
  const [filterStatus, setFilterStatus] = useState<"todos" | AdminUser["status"]>("todos");
  const [page, setPage] = useState(1);

  const neighborhoods = ["todos", "Centro", "Norte", "Sul", "Leste", "Oeste"];

  const filtered = adminUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchN = filterNeighborhood === "todos" || u.neighborhood === filterNeighborhood;
    const matchS = filterStatus === "todos" || u.status === filterStatus;
    return matchSearch && matchN && matchS;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = () => setPage(1);

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h3 className="font-display font-semibold text-foreground">Usuários Cadastrados</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} usuários encontrados</p>
          </div>

          <div className="sm:ml-auto flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-muted border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 w-36"
                style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.3)" } as React.CSSProperties}
              />
            </div>

            {/* Neighborhood filter */}
            <select
              value={filterNeighborhood}
              onChange={(e) => { setFilterNeighborhood(e.target.value); handleFilterChange(); }}
              className="px-2.5 py-1.5 rounded-lg bg-muted border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 cursor-pointer"
              style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.3)" } as React.CSSProperties}
            >
              {neighborhoods.map((n) => (
                <option key={n} value={n}>{n === "todos" ? "Todos os bairros" : n}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); handleFilterChange(); }}
              className="px-2.5 py-1.5 rounded-lg bg-muted border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 cursor-pointer"
              style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.3)" } as React.CSSProperties}
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40" style={{ background: "hsl(210 15% 97%)" }}>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Bairro</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">KM</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Dias Ativos</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Cadastro Completo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user, idx) => (
              <tr
                key={user.id}
                className="border-b border-border/30 transition-colors hover:bg-muted/30"
                style={idx % 2 === 1 ? { background: "hsl(210 15% 99%)" } : {}}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: "hsl(221 83% 53%)" }}
                    >
                      {user.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-foreground hidden md:table-cell">{user.neighborhood}</td>
                <td className="px-4 py-3.5 font-semibold text-foreground hidden sm:table-cell">{user.km} km</td>
                <td className="px-4 py-3.5 text-foreground hidden lg:table-cell">{user.activeDays} dias</td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  {user.profileComplete ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Completo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-500">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Pendente</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[user.status]}`}>
                    {statusLabel[user.status]}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Ver detalhes"
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "hsl(221 83% 53%)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(221 83% 53% / 0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Editar"
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-amber-600"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(43 96% 52% / 0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Bloquear"
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "hsl(0 84% 60%)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(0 84% 60% / 0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                p === page ? "text-white" : "text-muted-foreground hover:bg-muted"
              }`}
              style={p === page ? { background: "hsl(221 83% 53%)" } : {}}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
