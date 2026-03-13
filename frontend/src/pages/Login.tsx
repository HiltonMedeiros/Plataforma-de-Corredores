import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLogo, RunnerIllustration } from "@/components/auth/AuthShared";

// ── Validation schema ──────────────────────────────────────────────────────
const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido")
    .max(255, "Email muito longo"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .max(128, "Senha muito longa"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Login Page ─────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: FormData) => {
    setAuthError(null);
    try {
      await signIn(data.email, data.password, data.remember ?? false);
      navigate("/", { replace: true });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(160deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)",
      }}
    >
      {/* ── Logo ── */}
      <AuthLogo />

      {/* ── Illustration ── */}
      <div className="mb-2 animate-slide-up">
        <RunnerIllustration />
      </div>

      {/* ── Headline ── */}
      <div className="text-center mb-6 animate-slide-up">
        <h1 className="font-display font-bold text-2xl text-foreground">Bem-vindo de volta!</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Entre na sua conta para ver seu progresso
        </p>
      </div>

      {/* ── Form Card ── */}
      <div
        className="w-full max-w-sm animate-slide-up"
        style={{
          background: "hsl(var(--card))",
          borderRadius: "1.5rem",
          border: "1px solid hsl(var(--border) / 0.6)",
          boxShadow: "var(--shadow-lg)",
          padding: "1.75rem",
        }}
      >
        {/* Auth error banner */}
        {authError && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl mb-4"
            style={{ background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.25)" }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "hsl(var(--destructive))" }} />
            <p className="text-sm font-medium" style={{ color: "hsl(var(--destructive))" }}>
              {authError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={!!errors.email}
                className="w-full h-11 pl-10 pr-4 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
                style={{
                  background: "hsl(var(--muted) / 0.5)",
                  border: errors.email
                    ? "1.5px solid hsl(var(--destructive) / 0.7)"
                    : "1.5px solid hsl(var(--border))",
                  boxShadow: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? "hsl(var(--destructive) / 0.7)" : "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Senha
              </label>
              <Link
                to="/esqueci-senha"
                className="text-xs font-medium transition-colors"
                style={{ color: "hsl(var(--primary))" }}
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className="w-full h-11 pl-10 pr-12 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
                style={{
                  background: "hsl(var(--muted) / 0.5)",
                  border: errors.password
                    ? "1.5px solid hsl(var(--destructive) / 0.7)"
                    : "1.5px solid hsl(var(--border))",
                  boxShadow: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? "hsl(var(--destructive) / 0.7)" : "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                {...register("remember")}
              />
              <div
                className="w-4.5 h-4.5 rounded-md border-2 transition-all flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary"
                style={{ borderColor: "hsl(var(--border))", width: "18px", height: "18px" }}
              >
                <svg className="w-2.5 h-2.5 text-white hidden peer-checked:block" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Lembrar-me
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{
              background: "var(--gradient-hero)",
              boxShadow: "var(--shadow-primary)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Não tem uma conta?{" "}
          <Link
            to="/cadastro"
            className="font-semibold transition-colors"
            style={{ color: "hsl(var(--primary))" }}
          >
            Cadastre-se
          </Link>
        </p>
      </div>

      {/* Demo hint */}
      <div className="mt-5 px-4 py-2.5 rounded-xl flex items-center gap-2 max-w-sm w-full"
        style={{ background: "hsl(var(--accent))", border: "1px solid hsl(var(--primary) / 0.2)" }}
      >
        <span className="text-base">💡</span>
        <p className="text-xs text-accent-foreground">
          <span className="font-semibold">Demonstração:</span> use{" "}
          <span className="font-mono font-semibold">carlos@bayeux.com</span> / <span className="font-mono font-semibold">senha123</span>
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-6 text-center">
        Prefeitura de Bayeux · Programa de Saúde Pública
      </p>
    </div>
  );
}
