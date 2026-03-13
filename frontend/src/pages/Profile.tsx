import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Check,
  X,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Bell,
  Ruler,
  Lock,
  LogOut,
  Trophy,
  Activity,
  Target,
  Upload,
  FileCheck,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProfile, fetchMyActivities, fetchResidenceValidation, fetchMyAchievements } from "@/lib/api";
import avatarImg from "@/assets/avatar.jpg";

// ── User data object ────────────────────────────────────────────────────────
const defaultUserData = {
  name: "",
  email: "",
  phone: "",
  birthdate: "",
  neighborhood: "",
  totalKm: 0,
  activeDays: 0,
  medals: 0,
  currentKm: 0,
};

const defaultGoals = [
  { label: "Ouro", emoji: "🥇", target: 21, current: 0, gradient: "var(--gradient-gold)", shadow: "0 4px 16px hsl(43 96% 52% / 0.35)" },
  { label: "Diamante", emoji: "💎", target: 42, current: 0, gradient: "var(--gradient-diamond)", shadow: "0 4px 16px hsl(220 90% 60% / 0.35)" },
  { label: "Ultra (60km)", emoji: "🏆", target: 60, current: 0, gradient: "var(--gradient-hero)", shadow: "0 4px 16px hsl(152 72% 36% / 0.35)" },
];

// ── Profile completion fields ───────────────────────────────────────────────
type CompletionStep = {
  id: string;
  label: string;
  done: boolean;
};

// ── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="card-fitness flex flex-col items-center gap-1.5 py-4 px-2">
      <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center mb-0.5">{icon}</div>
      <span className="stat-number text-xl font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card-fitness p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="font-display font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EditableField({
  icon, label, value, editing, onSave, type = "text",
}: {
  icon: React.ReactNode; label: string; value: string; editing: boolean; onSave: (val: string) => void; type?: string;
}) {
  const [draft, setDraft] = useState(value);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSave(draft);
    if (e.key === "Escape") setDraft(value);
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground w-4 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{label}</p>
        {editing ? (
          <input
            className="w-full text-sm text-foreground bg-muted/60 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary/40 border border-border/60 transition-all"
            value={draft}
            type={type}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <p className="text-sm font-medium text-foreground truncate">{value}</p>
        )}
      </div>
      {editing && (
        <button
          onClick={() => onSave(draft)}
          className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Check className="w-3.5 h-3.5 text-primary" />
        </button>
      )}
    </div>
  );
}

function PrefRow({ icon, label, sublabel, children }: { icon: React.ReactNode; label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground w-4 shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Profile Completion Banner ───────────────────────────────────────────────
function ProfileCompletionBanner({
  steps,
  percent,
}: {
  steps: CompletionStep[];
  percent: number;
}) {
  const incomplete = steps.filter((s) => !s.done);
  if (percent === 100) {
    return (
      <div className="card-fitness p-4 flex items-center gap-3 border border-primary/20 bg-primary/5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Cadastro completo! ✓</p>
          <p className="text-xs text-muted-foreground">Você pode registrar atividades normalmente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-fitness p-4 space-y-3 border border-amber-200 bg-amber-50/50">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Complete seu cadastro para registrar atividades</p>
          <p className="text-xs text-amber-600 mt-0.5">
            {incomplete.length} {incomplete.length === 1 ? "etapa faltando" : "etapas faltando"} — {percent}% concluído
          </p>
        </div>
        <span className="text-lg font-bold text-amber-700">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, background: "hsl(43 96% 45%)" }}
        />
      </div>

      {/* Missing steps */}
      <div className="space-y-1">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                step.done ? "bg-primary" : "bg-amber-200"
              }`}
            >
              {step.done ? (
                <Check className="w-2.5 h-2.5 text-white" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" />
              )}
            </div>
            <span className={`text-xs ${step.done ? "text-muted-foreground line-through" : "text-amber-700 font-medium"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Residence Proof Upload ──────────────────────────────────────────────────
function ResidenceProofUpload({
  uploaded,
  fileName,
  onUpload,
}: {
  uploaded: boolean;
  fileName: string;
  onUpload: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-primary" />
          Comprovante de Residência
        </p>
        {uploaded && (
          <span className="text-xs text-primary font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Enviado
          </span>
        )}
      </div>

      {uploaded ? (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <FileCheck className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm text-foreground font-medium truncate flex-1">{fileName}</span>
          <button
            onClick={() => onUpload("")}
            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <label
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-amber-300 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer bg-amber-50/30"
        >
          <Upload className="w-5 h-5 text-amber-500" />
          <div className="text-center">
            <span className="text-sm font-semibold text-amber-700">Selecionar documento</span>
            <p className="text-xs text-muted-foreground mt-0.5">Conta de água, luz, gás ou telefone</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const name = e.target.files?.[0]?.name;
              if (name) onUpload(name);
            }}
          />
        </label>
      )}
    </div>
  );
}

// ── Main Profile Page ──────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const [info, setInfo] = useState(defaultUserData);
  const [goals, setGoals] = useState(defaultGoals);
  const [activities, setActivities] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [privateProfile, setPrivateProfile] = useState(false);

  // Profile completion state
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [residenceFileName, setResidenceFileName] = useState("");

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Fetch profile
        const profile = await fetchProfile();
        setInfo({
          name: profile.user?.first_name || user?.username || "",
          email: profile.user?.email || "",
          phone: profile.telefone || "",
          birthdate: profile.data_nascimento || "",
          neighborhood: profile.bairro_nome || "",
          totalKm: 0, // Will calculate from activities
          activeDays: 0, // Will calculate
          medals: 0, // Will fetch
          currentKm: 0, // Will calculate
        });
        setPhone(profile.telefone || "");
        setBirthdate(profile.data_nascimento || "");

        // Fetch activities
        const activitiesData = await fetchMyActivities();
        const activitiesList = activitiesData.results || activitiesData;
        setActivities(activitiesList);

        // Fetch achievements
        const achievementsData = await fetchMyAchievements();
        const achievementsList = achievementsData.results || achievementsData;
        setAchievements(achievementsList);

        // Calculate stats
        const totalKm = activitiesList.reduce((sum: number, act: any) => sum + (act.distancia || 0), 0);
        const activeDays = new Set(activitiesList.map((act: any) => act.data_atividade?.split('T')[0])).size;
        const medals = achievementsList.length; // Assuming each achievement is a medal

        setInfo(prev => ({ ...prev, totalKm, activeDays, medals, currentKm: totalKm }));

        // Update goals with current progress
        setGoals(prev => prev.map(goal => ({ ...goal, current: totalKm })));

        // Fetch residence validation
        const residence = await fetchResidenceValidation();
        if (residence.results && residence.results.length > 0) {
          setResidenceFileName(residence.results[0].comprovante || "");
        }

      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const hasPhone = phone.trim().length > 0;
  const hasBirthdate = birthdate.trim().length > 0;
  const hasResidenceProof = residenceFileName.trim().length > 0;

  const completionSteps: CompletionStep[] = [
    { id: "email", label: "Email cadastrado", done: !!info.email },
    { id: "phone", label: "Telefone preenchido", done: hasPhone },
    { id: "birthdate", label: "Data de nascimento preenchida", done: hasBirthdate },
    { id: "neighborhood", label: "Bairro informado", done: !!info.neighborhood },
    { id: "residence", label: "Comprovante de residência enviado", done: hasResidenceProof },
  ];

  const completionPercent = Math.round((completionSteps.filter((s) => s.done).length / completionSteps.length) * 100);

  const updateField = (field: keyof typeof info) => (val: string) => {
    setInfo((prev) => ({ ...prev, [field]: val }));
    if (field === "phone") setPhone(val);
    if (field === "birthdate") setBirthdate(val);
  };

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: "hsl(var(--secondary))" }}
      >
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-white" />
        </button>
        <span className="font-display font-bold text-white text-sm">Meu Perfil</span>
        <button
          onClick={() => setEditing((e) => !e)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
            editing ? "bg-primary text-white" : "bg-white/10 hover:bg-white/20 text-white"
          }`}
          aria-label={editing ? "Cancelar edição" : "Editar perfil"}
        >
          {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </button>
      </header>

      {/* ── Avatar Hero ── */}
      <div
        className="px-4 pt-6 pb-8 flex flex-col items-center gap-3 relative"
        style={{ background: "hsl(var(--secondary))" }}
      >
        <div className="relative">
          <img
            src={avatarImg}
            alt={info.name}
            className="w-24 h-24 rounded-3xl border-4 border-primary/60 object-cover shadow-lg"
          />
          {editing && (
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md active:scale-95 transition-transform">
              <Pencil className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-secondary flex items-center justify-center">
            <span className="text-[9px] text-white font-bold">✓</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-display font-bold text-white text-xl">
            {loading ? "Carregando..." : info.name || "Usuário"}
          </h1>
          <p className="text-white/60 text-xs mt-0.5 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            {loading ? "..." : (info.neighborhood || "Bairro não informado")} · Bayeux, PB
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-5 bg-background"
          style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
        />
      </div>

      {/* ── Content ── */}
      <main className="px-4 pb-24 space-y-4 max-w-lg mx-auto pt-5">

        {/* Profile Completion Banner */}
        <div className="animate-slide-up">
          <ProfileCompletionBanner steps={completionSteps} percent={completionPercent} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          <StatCard icon={<Activity className="w-4.5 h-4.5 text-primary" />} value={`${info.totalKm}`} label="Total KM" />
          <StatCard icon={<Target className="w-4.5 h-4.5 text-primary" />} value={info.activeDays} label="Dias ativos" />
          <StatCard icon={<Trophy className="w-4.5 h-4.5 text-primary" />} value={info.medals} label="Medalhas" />
        </div>

        {/* Personal Info */}
        <div className="animate-slide-up delay-100">
          <Section title="Informações Pessoais" icon={<Mail className="w-5 h-5" />}>
            <EditableField icon={<Mail className="w-4 h-4" />} label="Email" value={info.email} editing={editing} onSave={updateField("email")} type="email" />
            <EditableField icon={<Phone className="w-4 h-4" />} label="Telefone" value={phone} editing={editing} onSave={(v) => { updateField("phone")(v); setPhone(v); }} type="tel" />
            <EditableField icon={<Calendar className="w-4 h-4" />} label="Data de nascimento" value={birthdate} editing={editing} onSave={(v) => { updateField("birthdate")(v); setBirthdate(v); }} />
            <EditableField icon={<MapPin className="w-4 h-4" />} label="Bairro" value={info.neighborhood} editing={editing} onSave={updateField("neighborhood")} />
          </Section>
        </div>

        {/* Residence Proof */}
        <div className="animate-slide-up delay-150">
          <Section title="Comprovante de Residência" icon={<FileCheck className="w-5 h-5" />}>
            <p className="text-xs text-muted-foreground -mt-1">
              Obrigatório para participar do programa. Aceito: conta de água, luz, gás ou telefone.
            </p>
            <ResidenceProofUpload
              uploaded={hasResidenceProof}
              fileName={residenceFileName}
              onUpload={setResidenceFileName}
            />
          </Section>
        </div>

        {/* Preferences */}
        <div className="animate-slide-up delay-200">
          <Section title="Preferências" icon={<Bell className="w-5 h-5" />}>
            <PrefRow icon={<Bell className="w-4 h-4" />} label="Notificações" sublabel="Alertas de atividades e conquistas">
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </PrefRow>
            <PrefRow icon={<Ruler className="w-4 h-4" />} label="Unidade de medida">
              <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                {(["km", "mi"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      unit === u ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </PrefRow>
            <PrefRow icon={<Lock className="w-4 h-4" />} label="Perfil privado" sublabel="Ocultar do ranking público">
              <Switch checked={privateProfile} onCheckedChange={setPrivateProfile} />
            </PrefRow>
          </Section>
        </div>

        {/* Upcoming Goals */}
        <div className="animate-slide-up delay-300">
          <Section title="Próximas Conquistas" icon={<Trophy className="w-5 h-5" />}>
            <div className="space-y-3">
              {goals.map((goal) => {
                const pct = Math.min((goal.current / goal.target) * 100, 100);
                const remaining = Math.max(goal.target - goal.current, 0).toFixed(1);
                return (
                  <div key={goal.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{goal.emoji}</span>
                        <span className="text-sm font-semibold text-foreground">{goal.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{goal.current}/{goal.target} km</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: goal.gradient, boxShadow: pct > 0 ? goal.shadow : "none" }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Faltam <span className="font-semibold text-foreground">{remaining} km</span> para conquistar
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Sign Out */}
        <div className="animate-slide-up delay-400">
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-2xl border-2 border-destructive/70 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/5 active:scale-95 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sair da conta
          </button>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
