import { useState } from "react";
import { X, Upload, Timer, MapPin, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Profile completion check (in real app this would come from a context/store)
// For demo: we simulate checking localStorage for residence proof
function useProfileCompletion() {
  // Simulate: profile is incomplete if no residence proof stored
  const stored = typeof window !== "undefined" ? localStorage.getItem("bayeux_residence_proof") : null;
  return { isComplete: !!stored };
}

interface RegisterActivityModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterActivityModal({ open, onClose }: RegisterActivityModalProps) {
  const navigate = useNavigate();
  const { isComplete } = useProfileCompletion();

  const [type, setType] = useState<"corrida" | "caminhada">("corrida");
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [fileName, setFileName] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleGoToProfile = () => {
    onClose();
    navigate("/perfil");
  };

  // ── Gate: profile incomplete ─────────────────────────────────────────────
  if (!isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up shadow-2xl">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-5 sm:hidden" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex flex-col items-center text-center gap-4 pt-2 pb-2">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Cadastro Incompleto</h2>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Para registrar suas atividades no programa <strong>Bayeux em Movimento</strong>, você precisa completar 100% do seu cadastro, incluindo o{" "}
                <strong>comprovante de residência</strong>.
              </p>
            </div>

            <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">O que falta:</p>
              {[
                "Telefone preenchido",
                "Data de nascimento preenchida",
                "Comprovante de residência enviado",
              ].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" />
                  </div>
                  <span className="text-xs text-amber-700">{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleGoToProfile}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--gradient-hero)" }}
            >
              Completar meu cadastro
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal form ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up shadow-2xl">
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-5 sm:hidden" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-foreground">Registrar Atividade</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Tipo de Atividade</label>
            <div className="grid grid-cols-2 gap-2">
              {["corrida", "caminhada"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t as "corrida" | "caminhada")}
                  className={`p-3 rounded-xl text-sm font-semibold capitalize transition-all duration-150 ${
                    type === t ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {t === "corrida" ? "🏃‍♂️ Corrida" : "🚶‍♂️ Caminhada"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Distância</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number" step="0.1" min="0.1"
                value={distance} onChange={(e) => setDistance(e.target.value)}
                placeholder="Ex: 5.2" required
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-muted border border-border/50 text-foreground text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">km</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Tempo</label>
            <div className="relative">
              <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text" value={time} onChange={(e) => setTime(e.target.value)}
                placeholder="Ex: 28:30" required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border/50 text-foreground text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border/50 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Comprovante</label>
            <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/70 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground text-center">
                {fileName ? (
                  <span className="text-primary font-medium">{fileName}</span>
                ) : (
                  <>
                    <span className="text-primary font-semibold">Selecionar imagem</span>
                    <br />
                    <span className="text-xs">Strava, Garmin, Nike Run Club</span>
                  </>
                )}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
            </label>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-base mt-2">
            Salvar Atividade
          </button>
        </form>
      </div>
    </div>
  );
}
