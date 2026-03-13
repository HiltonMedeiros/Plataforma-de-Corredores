// Shared logo + illustration for auth pages
export function AuthLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md"
        style={{ background: "var(--gradient-hero)" }}
      >
        🏃
      </div>
      <div>
        <p className="font-display font-bold text-foreground text-lg leading-tight">
          Bayeux em
        </p>
        <p
          className="font-display font-bold text-lg leading-tight"
          style={{ color: "hsl(var(--primary))" }}
        >
          Movimento
        </p>
      </div>
    </div>
  );
}

export function RunnerIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={compact ? "w-full max-w-[140px] mx-auto" : "w-full max-w-[200px] mx-auto"}
      aria-hidden="true"
    >
      <line x1="20" y1="118" x2="180" y2="118" stroke="hsl(var(--border))" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="100" cy="119" rx="28" ry="4" fill="hsl(var(--muted))" />
      <line x1="95" y1="88" x2="75" y2="115" stroke="hsl(var(--secondary))" strokeWidth="5" strokeLinecap="round" />
      <line x1="75" y1="115" x2="68" y2="117" stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="88" x2="120" y2="112" stroke="hsl(var(--secondary))" strokeWidth="5" strokeLinecap="round" />
      <line x1="120" y1="112" x2="132" y2="117" stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="62" x2="100" y2="90" stroke="hsl(var(--secondary))" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="70" x2="82" y2="82" stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round" />
      <line x1="82" y1="82" x2="76" y2="78" stroke="hsl(var(--secondary))" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1="70" x2="118" y2="80" stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round" />
      <line x1="118" y1="80" x2="126" y2="74" stroke="hsl(var(--secondary))" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="100" cy="50" r="12" fill="hsl(var(--secondary))" />
      <path d="M 91 44 Q 82 38 85 50" stroke="hsl(var(--secondary))" strokeWidth="3" strokeLinecap="round" fill="none" />
      <line x1="55" y1="70" x2="68" y2="70" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <line x1="48" y1="80" x2="65" y2="80" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="52" y1="90" x2="66" y2="90" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <circle cx="148" cy="48" r="3" fill="hsl(var(--primary))" opacity="0.4" />
      <circle cx="158" cy="62" r="2" fill="hsl(var(--primary))" opacity="0.25" />
      <circle cx="142" cy="38" r="1.5" fill="hsl(var(--primary))" opacity="0.3" />
    </svg>
  );
}
