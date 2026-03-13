import { useState } from "react";
import { Plus, Pencil, X, Users } from "lucide-react";
import { adminMedals, Medal } from "@/data/adminMockData";

export function AdminMedals() {
  const [medals, setMedals] = useState(adminMedals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedal, setEditingMedal] = useState<Medal | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "🏅", description: "", requirement: "" });

  const openCreate = () => {
    setEditingMedal(null);
    setForm({ name: "", emoji: "🏅", description: "", requirement: "" });
    setModalOpen(true);
  };

  const openEdit = (medal: Medal) => {
    setEditingMedal(medal);
    setForm({ name: medal.name, emoji: medal.emoji, description: medal.description, requirement: medal.requirement });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingMedal) {
      setMedals((prev) => prev.map((m) => (m.id === editingMedal.id ? { ...m, ...form } : m)));
    } else {
      const newMedal: Medal = {
        id: Date.now(),
        ...form,
        usersEarned: 0,
        color: "#6366f1",
      };
      setMedals((prev) => [...prev, newMedal]);
    }
    setModalOpen(false);
  };

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden" style={{ boxShadow: "0 2px 8px hsl(220 25% 12% / 0.06)" }}>
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-foreground">Gerenciamento de Medalhas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{medals.length} medalhas configuradas</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "hsl(221 83% 53%)" }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Medalha</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {medals.map((medal) => (
            <div
              key={medal.id}
              className="relative rounded-2xl border border-border/40 p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md group"
              style={{ background: `${medal.color}10` }}
            >
              <button
                onClick={() => openEdit(medal)}
                className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <Pencil className="w-3 h-3" style={{ color: medal.color }} />
              </button>
              <span className="text-3xl">{medal.emoji}</span>
              <p className="font-display font-bold text-sm text-foreground">{medal.name}</p>
              <p className="text-xs text-muted-foreground text-center leading-tight">{medal.requirement}</p>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-3.5 h-3.5" style={{ color: medal.color }} />
                <span className="text-xs font-semibold" style={{ color: medal.color }}>{medal.usersEarned} usuários</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl border border-border/50 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-foreground">
                {editingMedal ? "Editar Medalha" : "Nova Medalha"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Emoji</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    className="w-16 py-2.5 rounded-xl bg-muted border border-border/50 text-center text-lg focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.3)" } as React.CSSProperties}
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Ultra"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.3)" } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Requisito</label>
                <input
                  type="text"
                  value={form.requirement}
                  onChange={(e) => setForm((f) => ({ ...f, requirement: e.target.value }))}
                  placeholder="Ex: 60 km acumulados"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.3)" } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descrição da conquista..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 resize-none"
                  style={{ "--tw-ring-color": "hsl(221 83% 53% / 0.3)" } as React.CSSProperties}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "hsl(221 83% 53%)" }}
            >
              {editingMedal ? "Salvar Alterações" : "Criar Medalha"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
