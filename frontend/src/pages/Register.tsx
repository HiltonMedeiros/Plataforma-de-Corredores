import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchBairros } from "@/lib/api";
import { AuthLogo, RunnerIllustration } from "@/components/auth/AuthShared";

// ── Neighbourhoods ─────────────────────────────────────────────────────────
const BAIRROS = ["Centro", "Norte", "Sul", "Leste", "Oeste"];

// ── Validation schema ──────────────────────────────────────────────────────
const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nome deve ter ao menos 3 caracteres")
      .max(100, "Nome muito longo"),
    email: z
      .string()
      .trim()
      .min(1, "Email é obrigatório")
      .email("Formato de email inválido")
      .max(255, "Email muito longo"),
    password: z
      .string()
      .min(6, "Mínimo de 6 caracteres")
      .max(128, "Senha muito longa"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"], {
      errorMap: () => ({ message: "Selecione o sexo" }),
    }),
    dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
    cpf: z
      .string()
      .trim()
      .min(11, "CPF inválido")
      .max(14, "CPF inválido"),
    telefone: z
      .string()
      .trim()
      .min(8, "Telefone inválido")
      .max(20, "Telefone inválido"),
    neighborhood: z.string().min(1, "Selecione um bairro"),
    terms: z.boolean().refine((v) => v === true, {
      message: "Você deve aceitar os termos para continuar",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

// ── Password strength helper ───────────────────────────────────────────────
function getStrength(pwd: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pwd) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, label: "Fraca", color: "hsl(var(--destructive))" };
  if (score === 2) return { level: 2, label: "Média", color: "hsl(43 96% 45%)" };
  return { level: 3, label: "Forte", color: "hsl(var(--primary))" };
}

// ── Reusable styled input ──────────────────────────────────────────────────
function FieldInput({
  id,
  type,
  placeholder,
  icon,
  suffix,
  hasError,
  isValid,
  autoComplete,
  registration,
}: {
  id: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  hasError: boolean;
  isValid: boolean;
  autoComplete?: string;
  registration: object;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={hasError}
        className="w-full h-11 pl-10 pr-10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
        style={{
          background: "hsl(var(--muted) / 0.5)",
          border: hasError
            ? "1.5px solid hsl(var(--destructive) / 0.7)"
            : isValid
            ? "1.5px solid hsl(var(--primary) / 0.6)"
            : "1.5px solid hsl(var(--border))",
          boxShadow: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "hsl(var(--primary))";
          e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = hasError
            ? "hsl(var(--destructive) / 0.7)"
            : isValid
            ? "hsl(var(--primary) / 0.6)"
            : "hsl(var(--border))";
        }}
        {...registration}
      />
      {/* Inline validation icon */}
      {suffix ? (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</span>
      ) : isValid ? (
        <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "hsl(var(--primary))" }} />
      ) : hasError ? (
        <XCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "hsl(var(--destructive))" }} />
      ) : null}
    </div>
  );
}

// ── Register Page ──────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bairros, setBairros] = useState<Array<{ id: number; nome: string }>>([]);
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [comprovanteName, setComprovanteName] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const passwordValue = watch("password") ?? "";
  const strength = getStrength(passwordValue);

  useEffect(() => {
    fetchBairros()
      .then((response) => {
        const list = response.results || [];
        setBairros(Array.isArray(list) ? list : []);
      })
      .catch((error) => {
        console.error("Erro ao carregar bairros:", error);
        setBairros([]);
      });
  }, []);

  const isFieldValid = (field: keyof FormData) =>
    !errors[field] && (touchedFields[field] || dirtyFields[field]);

  const onSubmit = async (data: FormData) => {
    setAuthError(null);

    const formData = new FormData();
    formData.append("username", data.email);
    formData.append("email", data.email);
    formData.append("first_name", data.name);
    formData.append("password", data.password);
    formData.append("password_confirm", data.confirmPassword);
    formData.append("sexo", data.sexo);
    formData.append("data_nascimento", data.dataNascimento);
    formData.append("cpf", data.cpf);
    formData.append("telefone", data.telefone);
    formData.append("bairro", data.neighborhood);
    formData.append("termo_responsabilidade", String(data.terms));
    formData.append("aceite_lgpd", String(data.terms));
    if (comprovanteFile) {
      formData.append("comprovante", comprovanteFile);
    }

    try {
      await signUp(formData, true);
      navigate("/", { replace: true });
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente."
      );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-8"
      style={{
        background:
          "linear-gradient(160deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)",
      }}
    >
      {/* Logo */}
      <AuthLogo />

      {/* Illustration (compact on register to save space) */}
      <div className="animate-slide-up mb-1">
        <RunnerIllustration compact />
      </div>

      {/* Headline */}
      <div className="text-center mb-5 animate-slide-up">
        <h1 className="font-display font-bold text-2xl text-foreground">Crie sua conta</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Junte-se ao programa e comece a conquistar medalhas!
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
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl mb-4"
            style={{
              background: "hsl(var(--destructive) / 0.08)",
              border: "1px solid hsl(var(--destructive) / 0.25)",
            }}
          >
            <AlertCircle
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: "hsl(var(--destructive))" }}
            />
            <p className="text-sm font-medium" style={{ color: "hsl(var(--destructive))" }}>
              {authError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">

          {/* Nome */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nome completo
            </label>
            <FieldInput
              id="name"
              type="text"
              placeholder="Carlos Oliveira"
              autoComplete="name"
              icon={<User className="w-4 h-4" />}
              hasError={!!errors.name}
              isValid={isFieldValid("name")}
              registration={register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </label>
            <FieldInput
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              icon={<Mail className="w-4 h-4" />}
              hasError={!!errors.email}
              isValid={isFieldValid("email")}
              registration={register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Sexo */}
          <div className="space-y-1.5">
            <label htmlFor="sexo" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sexo
            </label>
            <div className="relative">
              <select
                id="sexo"
                className="w-full h-11 pl-3 pr-10 rounded-xl text-sm text-foreground outline-none appearance-none transition-all cursor-pointer"
                style={{
                  background: "hsl(var(--muted) / 0.5)",
                  border: errors.sexo
                    ? "1.5px solid hsl(var(--destructive) / 0.7)"
                    : isFieldValid("sexo")
                    ? "1.5px solid hsl(var(--primary) / 0.6)"
                    : "1.5px solid hsl(var(--border))",
                }}
                {...register("sexo")}
              >
                <option value="">Selecione</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            {errors.sexo && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.sexo.message}
              </p>
            )}
          </div>

          {/* Data de nascimento */}
          <div className="space-y-1.5">
            <label htmlFor="dataNascimento" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Data de nascimento
            </label>
            <FieldInput
              id="dataNascimento"
              type="date"
              placeholder=""
              autoComplete="bday"
              icon={<Calendar className="w-4 h-4" />}
              hasError={!!errors.dataNascimento}
              isValid={isFieldValid("dataNascimento")}
              registration={register("dataNascimento")}
            />
            {errors.dataNascimento && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.dataNascimento.message}
              </p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-1.5">
            <label htmlFor="cpf" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              CPF
            </label>
            <FieldInput
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              autoComplete="off"
              icon={<MapPin className="w-4 h-4" />}
              hasError={!!errors.cpf}
              isValid={isFieldValid("cpf")}
              registration={register("cpf")}
            />
            {errors.cpf && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.cpf.message}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <label htmlFor="telefone" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Telefone
            </label>
            <FieldInput
              id="telefone"
              type="text"
              placeholder="(83) 91234-5678"
              autoComplete="tel"
              icon={<Phone className="w-4 h-4" />}
              hasError={!!errors.telefone}
              isValid={isFieldValid("telefone")}
              registration={register("telefone")}
            />
            {errors.telefone && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.telefone.message}
              </p>
            )}
          </div>

          {/* Bairro */}
          <div className="space-y-1.5">
            <label htmlFor="neighborhood" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bairro
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                id="neighborhood"
                className="w-full h-11 pl-10 pr-4 rounded-xl text-sm text-foreground outline-none appearance-none transition-all cursor-pointer"
                style={{
                  background: "hsl(var(--muted) / 0.5)",
                  border: errors.neighborhood
                    ? "1.5px solid hsl(var(--destructive) / 0.7)"
                    : isFieldValid("neighborhood")
                    ? "1.5px solid hsl(var(--primary) / 0.6)"
                    : "1.5px solid hsl(var(--border))",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--primary))";
                  e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "hsl(var(--border))";
                }}
                {...register("neighborhood")}
              >
                <option value="">Selecione seu bairro</option>
                {bairros.length > 0 ? (
                  bairros.map((b) => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))
                ) : (
                  <option value="">Carregando...</option>
                )}
              </select>
              {/* Chevron */}
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            {errors.neighborhood && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.neighborhood.message}
              </p>
            )}
          </div>

          {/* Comprovante de residência (opcional) */}
          <div className="space-y-1.5">
            <label htmlFor="comprovante" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Comprovante de residência (opcional)
            </label>
            <div className="relative">
              <input
                id="comprovante"
                type="file"
                accept="image/*,.pdf"
                className="w-full h-11 pl-3 pr-4 rounded-xl text-sm text-foreground outline-none transition-all file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                style={{
                  background: "hsl(var(--muted) / 0.5)",
                  border: "1.5px solid hsl(var(--border))",
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setComprovanteFile(file);
                  setComprovanteName(file ? file.name : "");
                }}
              />
            </div>
            {comprovanteName && (
              <p className="text-xs text-muted-foreground">
                Arquivo selecionado: {comprovanteName}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Senha
            </label>
            <FieldInput
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              icon={<Lock className="w-4 h-4" />}
              hasError={!!errors.password}
              isValid={isFieldValid("password")}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              registration={register("password")}
            />

            {/* Password strength bar */}
            {passwordValue.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          strength.level >= i
                            ? strength.color
                            : "hsl(var(--muted))",
                      }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-medium" style={{ color: strength.color }}>
                  Força da senha: {strength.label}
                </p>
              </div>
            )}

            {/* Requirements tooltip-style hint */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-0.5">
              {[
                { ok: passwordValue.length >= 6, text: "6+ caracteres" },
                { ok: /[A-Z]/.test(passwordValue), text: "Uma maiúscula" },
                { ok: /[0-9]/.test(passwordValue), text: "Um número" },
                { ok: /[^A-Za-z0-9]/.test(passwordValue), text: "Um símbolo" },
              ].map(({ ok, text }) => (
                <div key={text} className="flex items-center gap-1">
                  {ok ? (
                    <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: "hsl(var(--primary))" }} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border shrink-0" style={{ borderColor: "hsl(var(--muted-foreground) / 0.4)" }} />
                  )}
                  <span className="text-[10px]" style={{ color: ok ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {errors.password && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Confirmar senha
            </label>
            <FieldInput
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repita a senha"
              autoComplete="new-password"
              icon={<Lock className="w-4 h-4" />}
              hasError={!!errors.confirmPassword}
              isValid={isFieldValid("confirmPassword")}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              registration={register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--destructive))" }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-1">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="relative flex items-center mt-0.5 shrink-0">
                <input type="checkbox" className="peer sr-only" {...register("terms")} />
                <div
                  className="rounded-md border-2 transition-all flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary"
                  style={{ borderColor: errors.terms ? "hsl(var(--destructive))" : "hsl(var(--border))", width: "18px", height: "18px" }}
                >
                  <svg className="w-2.5 h-2.5 text-white hidden peer-checked:block" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                Aceito os{" "}
                <a href="#" className="font-semibold underline" style={{ color: "hsl(var(--primary))" }}>
                  termos de uso
                </a>{" "}
                e a{" "}
                <a href="#" className="font-semibold underline" style={{ color: "hsl(var(--primary))" }}>
                  política de privacidade
                </a>{" "}
                do programa Bayeux em Movimento
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs font-medium pl-7" style={{ color: "hsl(var(--destructive))" }}>
                {errors.terms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            style={{
              background: "var(--gradient-hero)",
              boxShadow: "var(--shadow-primary)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando conta…
              </>
            ) : (
              "Criar conta"
            )}
          </button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-semibold transition-colors"
            style={{ color: "hsl(var(--primary))" }}
          >
            Entrar
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-6 mb-8 text-center">
        Prefeitura de Bayeux · Programa de Saúde Pública
      </p>
    </div>
  );
}
