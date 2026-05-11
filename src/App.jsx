import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  // Base
  obsidian: "#05050F",
  abyss: "#080814",
  deep: "#0B0B1A",
  surface: "#101022",
  card: "#13132A",
  cardRaised: "#181832",
  cardHover: "#1C1C38",

  // Borders
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.10)",
  borderGold: "rgba(201,168,76,0.22)",
  borderGoldBright: "rgba(201,168,76,0.45)",

  // Gold palette
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDim: "#8B6914",
  goldFaint: "rgba(201,168,76,0.08)",
  goldGlow: "rgba(201,168,76,0.15)",
  goldGlow2: "rgba(201,168,76,0.05)",

  // Text
  white: "#F0EBE1",
  offwhite: "#C4BEB4",
  muted: "#5A5A78",
  faint: "#3A3A52",

  // Accents
  accent: "#6B5FEA",
  accentLight: "#9B91FF",
  accentGlow: "rgba(107,95,234,0.18)",
  accentFaint: "rgba(107,95,234,0.07)",
  success: "#3CB878",
  successFaint: "rgba(60,184,120,0.1)",
  danger: "#E85D75",
  dangerFaint: "rgba(232,93,117,0.1)",
  info: "#3B9EE8",
};

const LOGO_URL =
  "https://artjsvhhkusuoaifxcpl.supabase.co/storage/v1/object/sign/logo-acelera/WhatsApp%20Image%202026-05-09%20at%2017.43.46.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNGI5ZGM3Ny1iN2FhLTQwM2MtOGExZi0yNzQ1ZmY1ODQ4NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLWFjZWxlcmEvV2hhdHNBcHAgSW1hZ2UgMjAyNi0wNS0wOSBhdCAxNy40My40Ni5qcGVnIiwiaWF0IjoxNzc4MzQxNjY4LCJleHAiOjE4NDE0MTM2Njh9.4XliF9nN6m512YmixQgz2fULG9hN9muEDeR7bcOIbws";

const COURSE_INFO = {
  course: "Acelera – Carreira Com Propósito",
  edition: "4.0",
  eventDate: "2026-07-01T00:00:00+02:00",
  eventMonthLabel: "Julho de 2026",
};

const TYPE_COLORS = {
  keynote: C.gold,
  panel: C.accent,
  workshop: C.success,
  network: C.danger,
  break: C.muted,
  case: "#FF9F43",
  qa: C.gold,
  close: C.accent,
};

const REACTION_EMOJIS = ["❤️", "🔥", "👏", "😂", "💡"];

// ─── Utilities ─────────────────────────────────────────────────────────────────
function initials(name = "") {
  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AC"
  );
}

function formatTimeAgo(dateString) {
  if (!dateString) return "agora";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m}m`;
  if (h < 24) return `há ${h}h`;
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d}d`;
  return new Date(dateString).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

function getProgressStage(p) {
  if (p >= 100) return { label: "Pronta para Escalar", icon: "🏆" };
  if (p >= 75) return { label: "Aceleradora", icon: "🚀" };
  if (p >= 50) return { label: "Estratégica", icon: "⚡" };
  if (p >= 25) return { label: "Em Movimento", icon: "🔥" };
  return { label: "Exploradora", icon: "✦" };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date(targetDate);
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html {
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    min-height: 100%;
  }

  body, #root {
    width: 100%;
    min-height: 100dvh;
    margin: 0;
    background: #05050F;
    overscroll-behavior: none;
    overflow-x: hidden;
  }
  .dsp { font-family: 'Cormorant Garamond', Georgia, serif; }
  .sans { font-family: 'DM Sans', system-ui, sans-serif; }
  ::-webkit-scrollbar { width: 0; height: 0; }

  /* ── Animations ── */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.94) } to { opacity:1; transform:scale(1) } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(100%) } to { opacity:1; transform:translateY(0) } }
  @keyframes shimmer  { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
  @keyframes pulse    { 0%,100%{ box-shadow:0 0 0 0 rgba(201,168,76,0.55) } 60%{ box-shadow:0 0 0 8px rgba(201,168,76,0) } }
  @keyframes spin     { to { transform:rotate(360deg) } }
  @keyframes orb1     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.1)} 66%{transform:translate(-20px,10px) scale(0.95)} }
  @keyframes orb2     { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-25px,20px) scale(1.05)} 70%{transform:translate(15px,-15px) scale(0.9)} }
  @keyframes glow     { 0%,100%{opacity:0.4} 50%{opacity:0.75} }
  @keyframes countUp  { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes progressFill { from{width:0} to{width:var(--target-w)} }
  @keyframes tabBounce { 0%{transform:scale(1)} 40%{transform:scale(0.93)} 75%{transform:scale(1.04)} 100%{transform:scale(1)} }

  .fade-up   { animation: fadeUp  .45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in   { animation: fadeIn  .35s ease both; }
  .scale-in  { animation: scaleIn .35s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-up  { animation: slideUp .5s  cubic-bezier(0.22,1,0.36,1) both; }

  .stagger > * { animation: fadeUp .45s cubic-bezier(0.22,1,0.36,1) both; }
  .stagger > *:nth-child(1){animation-delay:.04s}
  .stagger > *:nth-child(2){animation-delay:.09s}
  .stagger > *:nth-child(3){animation-delay:.14s}
  .stagger > *:nth-child(4){animation-delay:.19s}
  .stagger > *:nth-child(5){animation-delay:.24s}
  .stagger > *:nth-child(6){animation-delay:.29s}
  .stagger > *:nth-child(7){animation-delay:.34s}
  .stagger > *:nth-child(8){animation-delay:.39s}
  .stagger > *:nth-child(9){animation-delay:.44s}

  .press { cursor:pointer; transition:transform .15s, opacity .15s; -webkit-user-select:none; user-select:none; }
  .press:active { transform:scale(0.97); opacity:0.85; }

  .glass {
    background: rgba(20,20,44,0.75);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
  }

  .skel {
    background: linear-gradient(90deg, #101022 25%, #181832 50%, #101022 75%);
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite;
    border-radius: 12px;
  }

  input, textarea { caret-color: #C9A84C; }
  input:focus, textarea:focus { outline:none; border-color: rgba(201,168,76,0.45) !important; }
  input::placeholder, textarea::placeholder { color: rgba(90,90,120,0.7); }

  .nav-pill { transition: all .22s cubic-bezier(0.22,1,0.36,1); }
  .nav-pill.active { animation: tabBounce .35s cubic-bezier(0.22,1,0.36,1); }

  .card-hover { transition: border-color .2s, transform .2s, box-shadow .2s; }
  .card-hover:hover { border-color: rgba(201,168,76,0.28) !important; transform: translateY(-1px); box-shadow: 0 8px 40px rgba(0,0,0,0.35); }

  .reaction-pill { transition: all .18s cubic-bezier(0.22,1,0.36,1); }
  .reaction-pill:hover { transform: translateY(-2px) scale(1.08); }

  .emoji-btn { transition: transform .18s cubic-bezier(0.22,1,0.36,1); }
  .emoji-btn:hover { transform: scale(1.18) translateY(-2px); }

  .gold-btn {
    background: linear-gradient(135deg, #E8C97A 0%, #C9A84C 45%, #8B6914 100%);
    box-shadow: 0 4px 24px rgba(201,168,76,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: all .22s;
  }
  .gold-btn:hover  { box-shadow: 0 6px 32px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,255,255,0.18); transform: translateY(-1px); }
  .gold-btn:active { transform: scale(0.97) translateY(0); box-shadow: 0 2px 12px rgba(201,168,76,0.3); }

  .pulse { animation: pulse 2.8s ease-in-out infinite; }
`;

// ─── Orb Background ──────────────────────────────────────────────────────────
function OrbBg({ variant = "gold" }) {
  const isGold = variant === "gold";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: isGold
            ? "radial-gradient(circle, rgba(201,168,76,0.22) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(107,95,234,0.22) 0%, transparent 70%)",
          top: "-40px",
          right: "-40px",
          animation: "orb1 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: isGold
            ? "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(107,95,234,0.12) 0%, transparent 70%)",
          bottom: "-20px",
          left: "-20px",
          animation: "orb2 11s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 64, mb = 10, radius = 14 }) {
  return (
    <div
      className="skel"
      style={{ height: h, marginBottom: mb, borderRadius: radius }}
    />
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 42, fontSize = 13 }) {
  const isImg = typeof src === "string" && src.startsWith("http");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: isImg
          ? `url(${src}) center/cover no-repeat`
          : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
        border: `1.5px solid rgba(201,168,76,0.3)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans",
        fontWeight: 800,
        fontSize,
        color: C.obsidian,
      }}
    >
      {!isImg && initials(name)}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({
  children,
  color = C.gold,
  bg = C.goldFaint,
  border = C.borderGold,
}) {
  return (
    <span
      className="sans"
      style={{
        display: "inline-block",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 999,
        padding: "3px 9px",
        fontSize: 9,
        fontWeight: 800,
        color,
        letterSpacing: 0.5,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ my = 24 }) {
  return (
    <div
      style={{
        height: 1,
        margin: `${my}px 0`,
        background: `linear-gradient(90deg, transparent, ${C.border} 20%, ${C.border} 80%, transparent)`,
      }}
    />
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div
      className="sans"
      style={{
        fontSize: 9,
        letterSpacing: 3.5,
        color: C.muted,
        textTransform: "uppercase",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{ display: "block", height: 1, width: 16, background: C.faint }}
      />
      {children}
      <span
        style={{
          display: "block",
          height: 1,
          flex: 1,
          background: `linear-gradient(90deg, ${C.faint}, transparent)`,
        }}
      />
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErr("Preenche o email e a senha.");
      return;
    }

    setLoading(true);
    setErr("");

    const cleanedEmail = email.trim().toLowerCase();
    const displayName = name.trim() || cleanedEmail.split("@")[0];

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email: cleanedEmail,
            password,
            options: {
              data: { name: displayName },
            },
          })
        : await supabase.auth.signInWithPassword({
            email: cleanedEmail,
            password,
          });

    if (result.error) {
      setErr(result.error.message);
      setLoading(false);
      return;
    }

    // Ao criar conta, já criamos/actualizamos também o perfil público.
    // Assim o utilizador aparece logo na tabela participants.
    if (mode === "signup" && result.data?.user?.id) {
      const { error: profileError } = await supabase
        .from("participants")
        .upsert(
          {
            id: result.data.user.id,
            name: displayName,
            email: cleanedEmail,
            avatar: null,
            progress: 0,
            role: "user",
          },
          { onConflict: "id" }
        );

      if (profileError) {
        setErr(
          "Conta criada, mas houve erro ao criar o perfil: " +
            profileError.message
        );
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        background: C.obsidian,
        minHeight: "100vh",
        color: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{GLOBAL_CSS}</style>
      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 60%)",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "glow 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(107,95,234,0.07) 0%, transparent 60%)",
            bottom: "-100px",
            right: "-100px",
            animation: "glow 8s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div
        className="scale-in"
        style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          background: "rgba(16,16,34,0.85)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: `1px solid ${C.borderGold}`,
          borderRadius: 28,
          padding: "32px 28px",
          boxShadow:
            "0 32px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <OrbBg />
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
            position: "relative",
          }}
        >
          <img
            src={LOGO_URL}
            alt="Acelera"
            style={{
              width: 220,
              height: 68,
              objectFit: "contain",
              filter: "drop-shadow(0 0 24px rgba(201,168,76,0.25))",
              marginBottom: 16,
            }}
          />
          <Badge>Acesso Exclusivo</Badge>
          <div
            className="dsp"
            style={{
              fontSize: 34,
              fontWeight: 700,
              marginTop: 10,
              lineHeight: 1,
            }}
          >
            Acelera <span style={{ color: C.gold }}>4.0</span>
          </div>
          <div
            className="sans"
            style={{
              fontSize: 13,
              color: C.muted,
              marginTop: 10,
              lineHeight: 1.6,
            }}
          >
            A tua área de preparação, comunidade
            <br />e jornada pré-evento.
          </div>
        </div>

        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {mode === "signup" && (
            <Field label="Nome">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome"
                style={inputStyle}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="teuemail@exemplo.com"
              style={inputStyle}
            />
          </Field>
          <Field label="Senha">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="mínimo 6 caracteres"
              style={inputStyle}
            />
          </Field>

          {err && (
            <div
              className="sans"
              style={{
                fontSize: 12,
                color: C.danger,
                background: C.dangerFaint,
                border: `1px solid rgba(232,93,117,0.2)`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="gold-btn sans"
            style={{
              width: "100%",
              marginTop: 8,
              border: "none",
              borderRadius: 16,
              padding: "15px",
              fontWeight: 800,
              fontSize: 14,
              color: C.obsidian,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "A processar…"
              : mode === "signup"
              ? "Criar conta"
              : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === "signup" ? "login" : "signup"));
            setErr("");
          }}
          className="sans"
          style={{
            width: "100%",
            marginTop: 12,
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "12px",
            color: C.offwhite,
            cursor: "pointer",
            fontSize: 13,
            transition: "all .2s",
          }}
        >
          {mode === "signup" ? "Já tenho conta — Entrar" : "Criar nova conta"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "14px 16px",
  color: "#F0EBE1",
  fontFamily: "DM Sans",
  fontSize: 14,
  transition: "border-color .2s",
};

function Field({ label, children }) {
  return (
    <div>
      <label
        className="sans"
        style={{
          fontSize: 11,
          color: C.muted,
          display: "block",
          marginBottom: 7,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation
  const [tab, setTab] = useState("home");
  const prevTab = useRef("home");

  // Profile
  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Content
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());

  // Community
  const [posts, setPosts] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [newMsg, setNewMsg] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);

  // Event
  const [eventInfo, setEventInfo] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const authUser = session?.user;
  const countdown = useCountdown(
    eventInfo?.event_date || COURSE_INFO.eventDate
  );

  const completedCount = completedModuleIds.size;
  const progress =
    modules.length > 0
      ? Math.round((completedCount / modules.length) * 100)
      : 0;
  const stage = getProgressStage(progress);

  const currentName =
    profile?.name ||
    authUser?.user_metadata?.name ||
    authUser?.email?.split("@")[0] ||
    "Participante";
  const currentEmail = profile?.email || authUser?.email || "";
  const currentRole = profile?.role || "user";
  const currentAvatar = profile?.avatar || null;
  const avatarIsImage =
    typeof currentAvatar === "string" && currentAvatar.startsWith("http");

  // Map URL
  const mapUrl =
    eventInfo?.maps_link ||
    (eventInfo?.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          eventInfo.address
        )}`
      : `https://www.google.com/maps/search/?api=1&query=Hotel+Polana+Maputo`);

  // ── Auth listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Profile ──
  useEffect(() => {
    let cancelled = false;

    async function loadOrCreateProfile() {
      if (!authUser?.id) {
        setProfile(null);
        return;
      }

      const fallback =
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "Participante";

      // 1) Primeiro procura pelo id real do utilizador autenticado.
      const { data: byId, error: byIdError } = await supabase
        .from("participants")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!cancelled && !byIdError && byId) {
        setProfile(byId);
        return;
      }

      // 2) Recuperação: se existir um perfil antigo com o mesmo email, liga-o ao id do Auth.
      const { data: byEmail } = await supabase
        .from("participants")
        .select("*")
        .eq("email", authUser.email)
        .maybeSingle();

      if (byEmail) {
        const { data: recovered, error: recoverError } = await supabase
          .from("participants")
          .update({
            id: authUser.id,
            name: byEmail.name || fallback,
            email: authUser.email,
            avatar: byEmail.avatar || null,
            progress: byEmail.progress || 0,
            role: byEmail.role || "user",
          })
          .eq("email", authUser.email)
          .select()
          .single();

        if (!cancelled && !recoverError && recovered) {
          setProfile(recovered);
          return;
        }
      }

      // 3) Se não existir nada, cria o perfil novo.
      const newProfile = {
        id: authUser.id,
        name: fallback,
        email: authUser.email,
        avatar: null,
        progress: 0,
        role: "user",
      };

      const { data: created, error: createError } = await supabase
        .from("participants")
        .upsert(newProfile, { onConflict: "id" })
        .select()
        .single();

      if (!cancelled) {
        if (!createError && created) setProfile(created);
        else setProfile(newProfile);
      }
    }

    loadOrCreateProfile();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id, authUser?.email]);

  // ── Module progress ──
  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      const { data } = await supabase
        .from("module_progress")
        .select("module_id")
        .eq("participant_id", profile.id)
        .eq("completed", true);
      if (data) setCompletedModuleIds(new Set(data.map((r) => r.module_id)));
    })();
  }, [profile?.id]);

  // ── Modules ──
  useEffect(() => {
    (async () => {
      setLoadingModules(true);
      const { data } = await supabase
        .from("modules")
        .select("*")
        .order("id", { ascending: true });
      if (data) setModules(data);
      setLoadingModules(false);
    })();
  }, []);

  // ── Event data ──
  useEffect(() => {
    (async () => {
      setLoadingEvent(true);
      const [evRes, agRes, spRes] = await Promise.all([
        supabase
          .from("event_info")
          .select("*")
          .eq("active", true)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("agenda")
          .select("*")
          .eq("active", true)
          .order("position", { ascending: true }),
        supabase.from("speakers").select("*").order("id", { ascending: true }),
      ]);
      if (!evRes.error && evRes.data) setEventInfo(evRes.data);
      if (!agRes.error && agRes.data) setAgenda(agRes.data);
      if (!spRes.error && spRes.data) setSpeakers(spRes.data);
      setLoadingEvent(false);
    })();
  }, []);

  // ── Community ──
  const fetchPosts = useCallback(async () => {
    setLoadingCommunity(true);
    const { data: rawPosts } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    const postList = rawPosts || [];
    if (postList.length === 0) {
      setPosts([]);
      setLoadingCommunity(false);
      return;
    }

    const postIds = postList.map((p) => p.id);
    const replyIds = [
      ...new Set(postList.map((p) => p.reply_to).filter(Boolean)),
    ];

    const [{ data: replyPosts }, { data: reactions }] = await Promise.all([
      replyIds.length
        ? supabase.from("community_posts").select("*").in("id", replyIds)
        : Promise.resolve({ data: [] }),
      supabase.from("community_reactions").select("*").in("post_id", postIds),
    ]);

    const pIds = [
      ...new Set(
        [...postList, ...(replyPosts || [])]
          .map((p) => p.participant_id)
          .filter(Boolean)
      ),
    ];
    const { data: participants } = pIds.length
      ? await supabase
          .from("participants")
          .select("id,name,email,avatar,role")
          .in("id", pIds)
      : { data: [] };

    const pMap = new Map((participants || []).map((p) => [p.id, p]));
    const rMap = new Map((replyPosts || []).map((p) => [p.id, p]));
    const rxByPost = new Map();
    (reactions || []).forEach((r) => {
      const list = rxByPost.get(r.post_id) || [];
      list.push(r);
      rxByPost.set(r.post_id, list);
    });

    const merged = postList.map((post) => {
      const author = pMap.get(post.participant_id) || {};
      const rx = rxByPost.get(post.id) || [];
      const summary = rx.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {});
      const myReaction = profile?.id
        ? rx.find((r) => r.participant_id === profile.id)
        : null;
      const repliedRaw = post.reply_to ? rMap.get(post.reply_to) : null;
      return {
        ...post,
        author,
        reactions: rx,
        reactionSummary: summary,
        myReaction,
        repliedPost: repliedRaw
          ? { ...repliedRaw, author: pMap.get(repliedRaw.participant_id) || {} }
          : null,
      };
    });
    setPosts(merged);
    setLoadingCommunity(false);
  }, [profile?.id]);

  useEffect(() => {
    fetchPosts();
  }, [profile?.id]);

  // ── Helpers ──
  const ensureProfile = async () => {
    if (profile?.id) return profile;
    if (!authUser?.id) return null;

    const fallbackProfile = {
      id: authUser.id,
      name: currentName,
      email: currentEmail,
      avatar: null,
      progress: 0,
      role: "user",
    };

    const { data, error } = await supabase
      .from("participants")
      .upsert(fallbackProfile, { onConflict: "id" })
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      return data;
    }

    return fallbackProfile;
  };

  const markModuleDone = async (mod) => {
    if (!mod?.id) return;
    const p = await ensureProfile();
    if (!p?.id) return;
    setCompletedModuleIds((prev) => new Set([...prev, mod.id]));
    const { data: ex } = await supabase
      .from("module_progress")
      .select("id")
      .eq("participant_id", p.id)
      .eq("module_id", mod.id)
      .maybeSingle();
    if (ex?.id)
      await supabase
        .from("module_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", ex.id);
    else
      await supabase.from("module_progress").insert({
        participant_id: p.id,
        module_id: mod.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    const next = completedModuleIds.size + 1;
    const nextP =
      modules.length > 0 ? Math.round((next / modules.length) * 100) : 0;
    await supabase
      .from("participants")
      .update({ progress: nextP })
      .eq("id", p.id);
    setProfile((prev) => ({ ...prev, progress: nextP }));
  };

  const reactToPost = async (postId, emoji) => {
    const p = await ensureProfile();
    if (!p?.id) return;
    const { data: ex } = await supabase
      .from("community_reactions")
      .select("id,emoji")
      .eq("post_id", postId)
      .eq("participant_id", p.id)
      .maybeSingle();
    if (ex?.id && ex.emoji === emoji)
      await supabase.from("community_reactions").delete().eq("id", ex.id);
    else if (ex?.id)
      await supabase
        .from("community_reactions")
        .update({ emoji })
        .eq("id", ex.id);
    else
      await supabase
        .from("community_reactions")
        .insert({ post_id: postId, participant_id: p.id, emoji });
    setReactionPickerFor(null);
    fetchPosts();
  };

  const sendMsg = async () => {
    if (!newMsg.trim()) return;
    const p = await ensureProfile();
    if (!p?.id) return;
    await supabase.from("community_posts").insert({
      participant_id: p.id,
      message: newMsg.trim(),
      reply_to: replyingTo?.id || null,
    });
    setNewMsg("");
    setReplyingTo(null);
    fetchPosts();
  };

  const scrollToPost = (id) => {
    const el = document.getElementById(`post-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.boxShadow = `0 0 0 2px ${C.gold}, 0 0 48px rgba(201,168,76,0.22)`;
    setTimeout(() => {
      el.style.boxShadow = "";
    }, 1800);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingPhoto(true);
    const ext = file.name.split(".").pop();
    const path = `${currentEmail.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true });
    if (error) {
      alert("Erro ao carregar foto: " + error.message);
      setUploadingPhoto(false);
      return;
    }
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
    setProfile((prev) => ({ ...prev, avatar: data?.publicUrl }));
    setUploadingPhoto(false);
  };

  const saveProfile = async () => {
    if (!profile?.name?.trim()) {
      alert("O nome não pode ficar vazio.");
      return;
    }
    setSavingProfile(true);
    const payload = {
      name: profile.name.trim(),
      avatar: profile.avatar || null,
    };
    const result = profile.id
      ? await supabase
          .from("participants")
          .update(payload)
          .eq("id", profile.id)
          .select()
          .single()
      : await supabase
          .from("participants")
          .insert({
            id: authUser?.id,
            ...payload,
            email: currentEmail,
            progress: profile.progress || 0,
            role: profile.role || "user",
          })
          .select()
          .single();
    if (result.error) {
      alert("Erro ao guardar: " + result.error.message);
      setSavingProfile(false);
      return;
    }
    setProfile(result.data);
    setSavingProfile(false);
    setProfileOpen(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCompletedModuleIds(new Set());
    setPosts([]);
    setProfileOpen(false);
  };

  const navigateTo = (id) => {
    prevTab.current = tab;
    setTab(id);
  };

  // ── Render guards ──
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.obsidian,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "DM Sans",
          color: C.gold,
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        <style>{GLOBAL_CSS}</style>
        <div
          style={{
            animation: "spin 1s linear infinite",
            width: 24,
            height: 24,
            border: `2px solid ${C.goldFaint}`,
            borderTopColor: C.gold,
            borderRadius: "50%",
            marginRight: 12,
          }}
        />
        A carregar Acelera…
      </div>
    );
  }
  if (!session) return <AuthScreen />;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        background: C.obsidian,
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        color: C.white,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className="glass"
        style={{
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: `1px solid ${C.border}`,
          boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 0 12px",
          }}
        >
          <img
            src={LOGO_URL}
            alt="Acelera"
            style={{
              width: 130,
              height: 40,
              objectFit: "contain",
              filter: "drop-shadow(0 0 16px rgba(201,168,76,0.28))",
            }}
          />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              className="sans"
              style={{
                fontSize: 8,
                letterSpacing: 3.5,
                color: C.gold,
                textTransform: "uppercase",
              }}
            >
              Acesso Exclusivo
            </div>
            <div
              className="dsp"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.offwhite,
                lineHeight: 1.3,
                marginTop: 2,
              }}
            >
              {COURSE_INFO.course}{" "}
              <span style={{ color: C.gold }}>{COURSE_INFO.edition}</span>
            </div>
          </div>
          {/* Avatar btn */}
          <button
            className="pulse press"
            onClick={() => setProfileOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              flexShrink: 0,
              border: "1.5px solid rgba(201,168,76,0.35)",
              cursor: "pointer",
              padding: 0,
              overflow: "hidden",
              background: avatarIsImage
                ? `url(${currentAvatar}) center/cover`
                : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "DM Sans",
              fontWeight: 800,
              fontSize: 13,
              color: C.obsidian,
            }}
          >
            {!avatarIsImage && initials(currentName)}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 4, paddingBottom: 12 }}>
          {[
            { id: "home", icon: "✦", label: "Início" },
            { id: "content", icon: "▶", label: "Conteúdo" },
            { id: "community", icon: "◈", label: "Comunidade" },
            { id: "event", icon: "◉", label: "Evento" },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigateTo(t.id)}
                className={`nav-pill${active ? " active" : ""} sans`}
                style={{
                  flex: 1,
                  border: active
                    ? `1px solid rgba(201,168,76,0.35)`
                    : `1px solid transparent`,
                  borderRadius: 10,
                  padding: "6px 4px",
                  cursor: "pointer",
                  background: active ? "rgba(201,168,76,0.12)" : "transparent",
                  color: active ? C.gold : C.muted,
                  fontSize: 9,
                  fontWeight: 600,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  transition: "all .22s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                {t.label}
                {active && (
                  <span
                    style={{
                      display: "block",
                      width: 14,
                      height: 2,
                      borderRadius: 1,
                      background: C.gold,
                      marginTop: 1,
                      boxShadow: `0 0 6px ${C.gold}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main style={{ padding: "0 20px 140px" }}>
        {/* ══════════ HOME ══════════════════════════════════════════════════ */}
        {tab === "home" && (
          <div className="stagger">
            {/* Welcome */}
            <div style={{ padding: "30px 0 24px" }}>
              <div
                className="sans"
                style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}
              >
                Olá de volta,
              </div>
              <div
                className="dsp"
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  lineHeight: 0.95,
                  marginTop: 6,
                  letterSpacing: -1,
                }}
              >
                {currentName.split(" ")[0]}
                <span style={{ color: C.gold }}> ✦</span>
              </div>
              <div
                className="sans"
                style={{
                  fontSize: 13,
                  color: C.muted,
                  marginTop: 10,
                  lineHeight: 1.7,
                }}
              >
                A tua jornada de carreira começa aqui,
                <br />
                muito antes do dia do evento.
              </div>
            </div>

            {/* Countdown */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 24,
                border: `1px solid rgba(201,168,76,0.2)`,
                background:
                  "linear-gradient(145deg, #15122D 0%, #0D0C1E 60%, #0A0C1A 100%)",
                padding: "24px 22px",
                marginBottom: 20,
                boxShadow:
                  "0 0 0 1px rgba(201,168,76,0.07), 0 16px 56px rgba(0,0,0,0.5)",
              }}
            >
              <OrbBg />
              {/* Dot grid */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(rgba(201,168,76,0.05) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                  borderRadius: "inherit",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div
                      className="sans"
                      style={{
                        fontSize: 8,
                        letterSpacing: 3.5,
                        color: C.gold,
                        textTransform: "uppercase",
                      }}
                    >
                      Contagem Regressiva
                    </div>
                    <div
                      className="dsp"
                      style={{
                        fontSize: 20,
                        color: C.offwhite,
                        marginTop: 4,
                        fontStyle: "italic",
                      }}
                    >
                      {eventInfo?.event_month || COURSE_INFO.eventMonthLabel}
                    </div>
                  </div>
                  <Badge>data provisória</Badge>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 8,
                  }}
                >
                  {[
                    ["d", "Dias"],
                    ["h", "Horas"],
                    ["m", "Min"],
                    ["s", "Seg"],
                  ].map(([k, label]) => (
                    <div
                      key={k}
                      style={{
                        background: "rgba(5,5,15,0.7)",
                        borderRadius: 16,
                        border: `1px solid rgba(201,168,76,0.1)`,
                        padding: "14px 4px",
                        textAlign: "center",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        key={countdown[k]}
                        className="dsp"
                        style={{
                          fontSize: 40,
                          fontWeight: 700,
                          color: C.gold,
                          lineHeight: 1,
                          animation: "countUp .35s cubic-bezier(0.22,1,0.36,1)",
                        }}
                      >
                        {String(countdown[k]).padStart(2, "0")}
                      </div>
                      <div
                        className="sans"
                        style={{
                          fontSize: 8,
                          color: C.muted,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          marginTop: 5,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 16,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.025)",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ fontSize: 13 }}>📍</span>
                  <span
                    className="sans"
                    style={{ fontSize: 11, color: C.muted }}
                  >
                    Hotel Polana · Maputo · Sala Grandes Nomes
                  </span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: "22px 20px",
                marginBottom: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    className="sans"
                    style={{ fontSize: 14, fontWeight: 600, color: C.white }}
                  >
                    Preparação Pré-Evento
                  </div>
                  <div
                    className="sans"
                    style={{ fontSize: 11, color: C.muted, marginTop: 4 }}
                  >
                    {completedCount} de {modules.length} módulos concluídos
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    className="dsp"
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      color: C.gold,
                      lineHeight: 1,
                    }}
                  >
                    {progress}
                    <span style={{ fontSize: 18, color: C.goldDim }}>%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 99,
                  height: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 99,
                    background: `linear-gradient(90deg, ${C.goldDim}, ${C.gold} 60%, ${C.goldLight})`,
                    width: `${progress}%`,
                    transition: "width 1.6s cubic-bezier(0.22,1,0.36,1)",
                    boxShadow: `0 0 12px ${C.gold}66`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.2) 50%,transparent 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  background: `linear-gradient(135deg, rgba(201,168,76,0.07), rgba(201,168,76,0.03))`,
                  border: `1px solid ${C.borderGold}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 20 }}>{stage.icon}</span>
                <div>
                  <div
                    className="sans"
                    style={{ fontSize: 10, color: C.muted }}
                  >
                    Nível da jornada
                  </div>
                  <div
                    className="dsp"
                    style={{ fontSize: 22, color: C.gold, fontWeight: 700 }}
                  >
                    {stage.label}
                  </div>
                </div>
              </div>

              {progress < 100 && (
                <div
                  className="sans"
                  style={{ fontSize: 11, color: C.muted, marginTop: 12 }}
                >
                  🔥 Continua — estás no bom caminho para o evento!
                </div>
              )}
            </div>

            {/* Speakers preview */}
            {speakers.length > 0 && (
              <>
                <SectionLabel>Quem vais encontrar</SectionLabel>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {speakers.map((s, i) => (
                    <div
                      key={i}
                      className="card-hover press"
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: 16,
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: `${s.color || C.gold}14`,
                          border: `2px solid ${s.color || C.gold}2C`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "DM Sans",
                          fontWeight: 800,
                          fontSize: 15,
                          color: s.color || C.gold,
                        }}
                      >
                        {s.avatar ||
                          (s.name || "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="sans"
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.white,
                          }}
                        >
                          {s.name}
                        </div>
                        <div
                          className="sans"
                          style={{ fontSize: 11, color: C.muted, marginTop: 2 }}
                        >
                          {s.role}
                        </div>
                        {s.topic && (
                          <div
                            className="dsp"
                            style={{
                              fontSize: 13,
                              fontStyle: "italic",
                              color: s.color || C.gold,
                              marginTop: 4,
                            }}
                          >
                            "{s.topic}"
                          </div>
                        )}
                      </div>
                      <div style={{ color: C.faint, fontSize: 16 }}>›</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Quote */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background: `linear-gradient(135deg, rgba(201,168,76,0.06), rgba(107,95,234,0.04))`,
                border: `1px solid rgba(201,168,76,0.12)`,
                borderRadius: 24,
                padding: "36px 28px",
                textAlign: "center",
                boxShadow: "0 16px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -10,
                  fontSize: 180,
                  color: "rgba(201,168,76,0.04)",
                  fontFamily: "Cormorant Garamond",
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                "
              </div>
              <div
                className="dsp"
                style={{
                  fontSize: 22,
                  fontStyle: "italic",
                  color: C.white,
                  lineHeight: 1.7,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                "Não é o programa que muda a carreira, é a pessoa que decides
                tornar-te a partir dele."
              </div>
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    height: 1,
                    width: 32,
                    background: `rgba(201,168,76,0.3)`,
                  }}
                />
                <span
                  className="sans"
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: C.gold,
                    textTransform: "uppercase",
                  }}
                >
                  Acelera 4.0
                </span>
                <div
                  style={{
                    height: 1,
                    width: 32,
                    background: `rgba(201,168,76,0.3)`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════ CONTENT ═══════════════════════════════════════════════ */}
        {tab === "content" && (
          <div className="fade-in">
            <div style={{ padding: "30px 0 22px" }}>
              <div
                className="dsp"
                style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.05 }}
              >
                Módulos <span style={{ color: C.gold }}>Pré-Evento</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 13, color: C.muted, marginTop: 8 }}
              >
                Prepara a tua mente antes de chegares.
              </div>
            </div>

            {loadingModules &&
              [1, 2, 3].map((i) => <Skeleton key={i} h={80} mb={10} />)}

            {!loadingModules && modules.length === 0 && (
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <div className="sans" style={{ fontSize: 13, color: C.muted }}>
                  Nenhum módulo encontrado. Confirma a tabela{" "}
                  <strong style={{ color: C.white }}>modules</strong> no
                  Supabase.
                </div>
              </div>
            )}

            <div className="stagger">
              {modules.map((m) => {
                const unlocked =
                  m.unlocked ||
                  !m.unlock_date ||
                  new Date(m.unlock_date) <= new Date();
                const expanded = expandedModule === m.id;
                const done = completedModuleIds.has(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() =>
                      unlocked && setExpandedModule(expanded ? null : m.id)
                    }
                    className={unlocked ? "card-hover" : ""}
                    style={{
                      background: C.card,
                      border: `1px solid ${
                        done ? "rgba(60,184,120,0.25)" : C.border
                      }`,
                      borderRadius: 18,
                      padding: 16,
                      marginBottom: 10,
                      opacity: unlocked ? 1 : 0.5,
                      cursor: unlocked ? "pointer" : "default",
                      transition: "all .25s",
                      boxShadow: done
                        ? "0 0 0 1px rgba(60,184,120,0.1)"
                        : "none",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          flexShrink: 0,
                          background: unlocked
                            ? done
                              ? C.successFaint
                              : C.goldFaint
                            : "rgba(255,255,255,0.02)",
                          border: `1px solid ${
                            unlocked
                              ? done
                                ? "rgba(60,184,120,0.3)"
                                : C.borderGold
                              : C.border
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 26,
                          transition: "all .25s",
                        }}
                      >
                        {m.icon || "▶"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            className="sans"
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: unlocked ? C.white : C.muted,
                            }}
                          >
                            {m.title}
                          </div>
                          {!unlocked ? (
                            <span style={{ fontSize: 14 }}>🔒</span>
                          ) : done ? (
                            <span
                              className="sans"
                              style={{
                                fontSize: 10,
                                color: C.success,
                                background: C.successFaint,
                                border: "1px solid rgba(60,184,120,0.2)",
                                borderRadius: 999,
                                padding: "3px 8px",
                              }}
                            >
                              ✓ Feito
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: 14,
                                color: C.muted,
                                display: "inline-block",
                                transform: expanded
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                                transition: "transform .25s",
                              }}
                            >
                              ▾
                            </span>
                          )}
                        </div>
                        <div
                          className="sans"
                          style={{ fontSize: 11, color: C.muted, marginTop: 3 }}
                        >
                          {m.duration || "Em breve"}
                        </div>
                      </div>
                    </div>

                    {unlocked && expanded && (
                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          className="sans"
                          style={{
                            fontSize: 13,
                            color: C.offwhite,
                            lineHeight: 1.75,
                          }}
                        >
                          {m.teaser}
                        </div>
                        {m.content_link ? (
                          <a
                            href={m.content_link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => markModuleDone(m)}
                            className="gold-btn"
                            style={{
                              display: "block",
                              textAlign: "center",
                              marginTop: 14,
                              borderRadius: 14,
                              padding: "13px",
                              fontFamily: "DM Sans",
                              fontWeight: 800,
                              fontSize: 14,
                              color: C.obsidian,
                              textDecoration: "none",
                            }}
                          >
                            ▶ Assistir Módulo
                          </a>
                        ) : (
                          <div
                            className="sans"
                            style={{
                              marginTop: 14,
                              background: "rgba(255,255,255,0.02)",
                              border: `1px solid ${C.border}`,
                              borderRadius: 12,
                              padding: 13,
                              textAlign: "center",
                              fontSize: 13,
                              color: C.muted,
                            }}
                          >
                            Link em breve
                          </div>
                        )}
                      </div>
                    )}
                    {!unlocked && m.teaser && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 10,
                        }}
                      >
                        <div
                          className="sans"
                          style={{ fontSize: 12, color: C.muted }}
                        >
                          {m.teaser}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bonus */}
            <div
              style={{
                background: C.accentFaint,
                border: `1px solid rgba(107,95,234,0.22)`,
                borderRadius: 16,
                padding: "18px 20px",
                marginTop: 10,
              }}
            >
              <div
                className="sans"
                style={{ fontSize: 12, color: "#A09BFF", lineHeight: 1.75 }}
              >
                🎁 <strong style={{ color: C.white }}>Bónus exclusivo:</strong>{" "}
                Quem completa os módulos disponíveis recebe materiais de apoio
                entregues no evento.
              </div>
            </div>
          </div>
        )}

        {/* ══════════ COMMUNITY ════════════════════════════════════════════ */}
        {tab === "community" && (
          <div className="fade-in">
            <div style={{ padding: "30px 0 22px" }}>
              <div className="dsp" style={{ fontSize: 36, fontWeight: 700 }}>
                Comunidade <span style={{ color: C.gold }}>✦</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 13, color: C.muted, marginTop: 6 }}
              >
                {loadingCommunity
                  ? "A carregar conversas…"
                  : `${posts.length} mensagens da comunidade`}
              </div>
            </div>

            {/* Compose box */}
            <div
              style={{
                background: `linear-gradient(160deg, ${C.cardRaised}, ${C.card})`,
                border: `1px solid ${C.borderGold}`,
                borderRadius: 20,
                padding: 18,
                marginBottom: 20,
                boxShadow:
                  "0 16px 56px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,168,76,0.05)",
              }}
            >
              {replyingTo && (
                <div
                  style={{
                    background: "rgba(201,168,76,0.07)",
                    border: `1px solid ${C.borderGold}`,
                    borderRadius: 14,
                    padding: "10px 14px",
                    marginBottom: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="sans"
                      style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}
                    >
                      A responder a {replyingTo.author?.name || "participante"}
                    </div>
                    <div
                      className="sans"
                      style={{
                        fontSize: 12,
                        color: C.offwhite,
                        marginTop: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {replyingTo.message}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: C.muted,
                      fontSize: 20,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <Avatar src={currentAvatar} name={currentName} size={40} />
                <textarea
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder={
                    replyingTo
                      ? "Escreve a tua resposta…"
                      : "Partilha uma ideia, dúvida ou conquista…"
                  }
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                    color: C.white,
                    fontFamily: "DM Sans",
                    fontSize: 13,
                    resize: "none",
                    height: 90,
                    lineHeight: 1.6,
                    transition: "border-color .2s",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="sans" style={{ fontSize: 10, color: C.faint }}>
                  Visível para participantes do Acelera.
                </div>
                <button
                  onClick={sendMsg}
                  disabled={!newMsg.trim()}
                  className={newMsg.trim() ? "gold-btn" : ""}
                  style={{
                    background: newMsg.trim()
                      ? undefined
                      : "rgba(255,255,255,0.04)",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 20px",
                    fontFamily: "DM Sans",
                    fontWeight: 800,
                    fontSize: 13,
                    color: newMsg.trim() ? C.obsidian : C.muted,
                    cursor: newMsg.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  {replyingTo ? "Responder" : "Publicar"}
                </button>
              </div>
            </div>

            {loadingCommunity &&
              [1, 2, 3].map((i) => <Skeleton key={i} h={130} mb={12} />)}

            {!loadingCommunity && posts.length === 0 && (
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: 28,
                  textAlign: "center",
                }}
              >
                <div
                  className="dsp"
                  style={{ fontSize: 26, color: C.gold, marginBottom: 8 }}
                >
                  Ainda está silencioso.
                </div>
                <div className="sans" style={{ fontSize: 13, color: C.muted }}>
                  Sê a primeira pessoa a partilhar algo com a comunidade.
                </div>
              </div>
            )}

            <div className="stagger">
              {posts.map((p) => {
                const authorName = p.author?.name || "Participante";
                const aImg = p.author?.avatar;
                return (
                  <div
                    id={`post-${p.id}`}
                    key={p.id}
                    style={{
                      background: `linear-gradient(160deg, ${C.cardRaised}, ${C.card})`,
                      border: `1px solid ${C.border}`,
                      borderRadius: 20,
                      padding: 18,
                      marginBottom: 12,
                      transition: "box-shadow .35s, transform .2s",
                      scrollMarginTop: 130,
                    }}
                  >
                    {/* Author row */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <Avatar src={aImg} name={authorName} size={44} />
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div
                            className="sans"
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.white,
                            }}
                          >
                            {authorName}
                          </div>
                          <div
                            className="sans"
                            style={{
                              fontSize: 10,
                              color: C.muted,
                              marginTop: 2,
                            }}
                          >
                            {formatTimeAgo(p.created_at)}
                          </div>
                        </div>
                        {p.author?.role === "admin" && <Badge>admin</Badge>}
                      </div>
                    </div>

                    {/* Reply preview */}
                    {p.repliedPost && (
                      <button
                        onClick={() => scrollToPost(p.repliedPost.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "rgba(201,168,76,0.06)",
                          border: `1px solid ${C.borderGold}`,
                          borderRadius: 12,
                          padding: "9px 12px",
                          marginBottom: 12,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          className="sans"
                          style={{
                            fontSize: 10,
                            color: C.gold,
                            fontWeight: 700,
                          }}
                        >
                          ↩ Em resposta a{" "}
                          {p.repliedPost.author?.name || "participante"}
                        </div>
                        <div
                          className="sans"
                          style={{
                            fontSize: 12,
                            color: C.offwhite,
                            marginTop: 3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.repliedPost.message}
                        </div>
                      </button>
                    )}

                    {/* Message */}
                    <div
                      className="sans"
                      style={{
                        fontSize: 13,
                        color: C.offwhite,
                        lineHeight: 1.75,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {p.message}
                    </div>

                    {/* Reaction pills */}
                    {Object.keys(p.reactionSummary || {}).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginTop: 12,
                        }}
                      >
                        {Object.entries(p.reactionSummary).map(
                          ([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => reactToPost(p.id, emoji)}
                              className="reaction-pill"
                              style={{
                                border: `1px solid ${
                                  p.myReaction?.emoji === emoji
                                    ? C.borderGoldBright
                                    : C.border
                                }`,
                                background:
                                  p.myReaction?.emoji === emoji
                                    ? C.goldGlow
                                    : "rgba(255,255,255,0.03)",
                                color: C.offwhite,
                                borderRadius: 999,
                                padding: "5px 10px",
                                cursor: "pointer",
                                fontFamily: "DM Sans",
                                fontSize: 12,
                                boxShadow:
                                  p.myReaction?.emoji === emoji
                                    ? `0 0 12px rgba(201,168,76,0.25)`
                                    : "none",
                              }}
                            >
                              {emoji} {count}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 14,
                        position: "relative",
                      }}
                    >
                      <button
                        onClick={() =>
                          setReactionPickerFor(
                            reactionPickerFor === p.id ? null : p.id
                          )
                        }
                        style={{
                          background: p.myReaction
                            ? C.goldGlow2
                            : "transparent",
                          border: `1px solid ${
                            p.myReaction ? C.borderGold : C.border
                          }`,
                          borderRadius: 20,
                          padding: "6px 14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: p.myReaction ? C.gold : C.muted,
                          fontFamily: "DM Sans",
                          fontSize: 12,
                          transition: "all .18s",
                        }}
                      >
                        {p.myReaction?.emoji || "♡"} Reagir
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        style={{
                          background: "transparent",
                          border: `1px solid ${C.border}`,
                          borderRadius: 20,
                          padding: "6px 14px",
                          cursor: "pointer",
                          color: C.muted,
                          fontFamily: "DM Sans",
                          fontSize: 12,
                          transition: "all .18s",
                        }}
                      >
                        Responder
                      </button>

                      {reactionPickerFor === p.id && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            bottom: 40,
                            background: C.cardHover,
                            border: `1px solid ${C.borderGold}`,
                            borderRadius: 999,
                            padding: "8px 10px",
                            display: "flex",
                            gap: 6,
                            zIndex: 30,
                            boxShadow:
                              "0 16px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08)",
                            animation:
                              "scaleIn .2s cubic-bezier(0.22,1,0.36,1)",
                          }}
                        >
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => reactToPost(p.id, emoji)}
                              className="emoji-btn"
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                border: "none",
                                background:
                                  p.myReaction?.emoji === emoji
                                    ? C.goldGlow
                                    : "rgba(255,255,255,0.04)",
                                cursor: "pointer",
                                fontSize: 18,
                                boxShadow:
                                  p.myReaction?.emoji === emoji
                                    ? `0 0 12px rgba(201,168,76,0.4)`
                                    : "none",
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ EVENT ════════════════════════════════════════════════ */}
        {tab === "event" && (
          <div className="fade-in">
            <div style={{ padding: "30px 0 22px" }}>
              <div className="dsp" style={{ fontSize: 36, fontWeight: 700 }}>
                O <span style={{ color: C.gold }}>Evento</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 13, color: C.muted, marginTop: 6 }}
              >
                Sabe o que te espera no dia.
              </div>
            </div>

            {loadingEvent && (
              <>
                <Skeleton h={120} mb={16} />
                <Skeleton h={60} mb={10} />
                <Skeleton h={60} mb={10} />
                <Skeleton h={60} mb={10} />
              </>
            )}

            {!loadingEvent && (
              <div className="stagger">
                {/* Location card */}
                <div
                  style={{
                    background: "linear-gradient(145deg, #14102A, #0D0F20)",
                    border: `1px solid rgba(107,95,234,0.22)`,
                    borderRadius: 22,
                    padding: 22,
                    marginBottom: 20,
                    boxShadow:
                      "0 0 0 1px rgba(107,95,234,0.06), 0 14px 50px rgba(107,95,234,0.08)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <OrbBg variant="accent" />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          flexShrink: 0,
                          background: C.accentFaint,
                          border: `1px solid rgba(107,95,234,0.25)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                        }}
                      >
                        📍
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          className="sans"
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: C.white,
                            lineHeight: 1.3,
                          }}
                        >
                          {eventInfo?.venue ||
                            "Hotel Polana — Sala Grandes Nomes"}
                        </div>
                        <div
                          className="sans"
                          style={{ fontSize: 12, color: C.muted, marginTop: 4 }}
                        >
                          {eventInfo?.address || "Av. Julius Nyerere, Maputo"}
                        </div>
                        {(eventInfo?.event_month || eventInfo?.event_date) && (
                          <div
                            className="sans"
                            style={{
                              fontSize: 11,
                              color: C.accentLight,
                              marginTop: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span>📅</span>
                            {eventInfo?.event_month ||
                              new Date(eventInfo.event_date).toLocaleDateString(
                                "pt-PT"
                              )}
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        marginTop: 18,
                        background: "rgba(107,95,234,0.15)",
                        border: `1px solid rgba(107,95,234,0.28)`,
                        borderRadius: 14,
                        padding: "13px",
                        textDecoration: "none",
                        fontFamily: "DM Sans",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#A09BFF",
                        transition: "all .22s",
                      }}
                    >
                      🗺️ Abrir no Google Maps
                    </a>

                    {eventInfo?.description && (
                      <div
                        className="sans"
                        style={{
                          fontSize: 12,
                          color: C.muted,
                          marginTop: 16,
                          lineHeight: 1.7,
                        }}
                      >
                        {eventInfo.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Speakers */}
                {speakers.length > 0 && (
                  <>
                    <SectionLabel>Oradores</SectionLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        marginBottom: 20,
                      }}
                    >
                      {speakers.map((s, i) => (
                        <div
                          key={i}
                          className="card-hover press"
                          style={{
                            background: C.card,
                            border: `1px solid ${C.border}`,
                            borderRadius: 16,
                            padding: "16px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: `${s.color || C.gold}14`,
                              border: `2px solid ${s.color || C.gold}28`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "DM Sans",
                              fontWeight: 800,
                              fontSize: 15,
                              color: s.color || C.gold,
                            }}
                          >
                            {s.avatar ||
                              (s.name || "")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              className="sans"
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: C.white,
                              }}
                            >
                              {s.name}
                            </div>
                            <div
                              className="sans"
                              style={{
                                fontSize: 11,
                                color: C.muted,
                                marginTop: 2,
                              }}
                            >
                              {s.role}
                            </div>
                            {s.topic && (
                              <div
                                className="dsp"
                                style={{
                                  fontSize: 13,
                                  fontStyle: "italic",
                                  color: s.color || C.gold,
                                  marginTop: 4,
                                }}
                              >
                                "{s.topic}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Agenda */}
                {agenda.length > 0 && (
                  <>
                    <SectionLabel>Agenda do Dia</SectionLabel>
                    <div style={{ position: "relative", marginBottom: 22 }}>
                      {/* Timeline line */}
                      <div
                        style={{
                          position: "absolute",
                          left: 44,
                          top: 10,
                          bottom: 10,
                          width: 1,
                          background: `linear-gradient(180deg, transparent, ${C.border} 8%, ${C.border} 92%, transparent)`,
                        }}
                      />
                      {agenda.map((a, i) => {
                        const dot = TYPE_COLORS[a.type] || C.muted;
                        return (
                          <div
                            key={a.id || i}
                            style={{
                              display: "flex",
                              gap: 10,
                              marginBottom: 10,
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              className="sans"
                              style={{
                                fontSize: 10,
                                color: C.muted,
                                width: 38,
                                textAlign: "right",
                                paddingTop: 12,
                                flexShrink: 0,
                              }}
                            >
                              {a.time}
                            </div>
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${dot}, rgba(255,255,255,0.6))`,
                                border: `3px solid ${C.obsidian}`,
                                flexShrink: 0,
                                marginTop: 11,
                                zIndex: 1,
                                boxShadow: `0 0 18px ${dot}99`,
                              }}
                            />
                            <div
                              style={{
                                flex: 1,
                                background: `linear-gradient(135deg, ${C.card}, ${C.cardHover})`,
                                border: `1px solid ${dot}28`,
                                borderRadius: 16,
                                padding: "13px 16px",
                                boxShadow: `0 0 24px ${dot}12`,
                              }}
                            >
                              <div
                                className="sans"
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: C.white,
                                }}
                              >
                                {a.title}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  marginTop: 5,
                                }}
                              >
                                <div
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background: dot,
                                  }}
                                />
                                <span
                                  className="sans"
                                  style={{
                                    fontSize: 9,
                                    color: dot,
                                    textTransform: "capitalize",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  {a.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* What to bring */}
                <SectionLabel>O que trazer</SectionLabel>
                <div
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 18,
                    padding: "20px 22px",
                  }}
                >
                  {[
                    {
                      icon: "🎟️",
                      text: "Bilhete (este app funciona como bilhete)",
                    },
                    {
                      icon: "💼",
                      text: "Cartão de visita ou contacto digital",
                    },
                    {
                      icon: "📓",
                      text: "Bloco de notas — vais querer escrever muito",
                    },
                    { icon: "🌟", text: "Mente aberta e vontade de crescer" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: i < 3 ? 14 : 0,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          flexShrink: 0,
                          background: C.goldFaint,
                          border: `1px solid ${C.borderGold}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div
                        className="sans"
                        style={{
                          fontSize: 13,
                          color: C.offwhite,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── PROFILE MODAL ──────────────────────────────────────────────────── */}
      {profileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: 999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 430,
              position: "relative",
              overflow: "hidden",
              background: "rgba(16,16,34,0.92)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: `1px solid ${C.borderGold}`,
              borderRadius: 28,
              padding: 24,
              boxShadow:
                "0 24px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <OrbBg />
            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 22,
                }}
              >
                <div>
                  <div
                    className="dsp"
                    style={{ fontSize: 30, fontWeight: 700, color: C.white }}
                  >
                    Meu Perfil
                  </div>
                  <div
                    className="sans"
                    style={{ fontSize: 12, color: C.muted, marginTop: 3 }}
                  >
                    Actualiza os teus dados.
                  </div>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `1px solid ${C.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: C.offwhite,
                    cursor: "pointer",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Avatar section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: avatarIsImage
                      ? `url(${currentAvatar}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                    border: `2px solid rgba(201,168,76,0.35)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "DM Sans",
                    fontWeight: 800,
                    fontSize: 22,
                    color: C.obsidian,
                    boxShadow: "0 8px 32px rgba(201,168,76,0.2)",
                  }}
                >
                  {!avatarIsImage && initials(currentName)}
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    className="sans"
                    style={{
                      display: "inline-block",
                      background: C.goldFaint,
                      border: `1px solid ${C.borderGold}`,
                      color: C.gold,
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {uploadingPhoto ? "A carregar…" : "Alterar foto"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                      disabled={uploadingPhoto}
                    />
                  </label>
                  <div
                    className="sans"
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      marginTop: 8,
                      lineHeight: 1.6,
                    }}
                  >
                    A foto fica guardada no teu perfil.
                  </div>
                </div>
              </div>

              <Divider my={0} />
              <div style={{ height: 20 }} />

              {/* Fields */}
              <Field label="Nome">
                <input
                  value={profile?.name || ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  style={{ ...inputStyle, borderRadius: 12 }}
                />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Email">
                <div
                  className="sans"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  {currentEmail}
                </div>
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    className="sans"
                    style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}
                  >
                    Progresso
                  </div>
                  <div
                    className="dsp"
                    style={{ fontSize: 30, color: C.gold, lineHeight: 1 }}
                  >
                    {progress}
                    <span style={{ fontSize: 14, color: C.goldDim }}>%</span>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    className="sans"
                    style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}
                  >
                    Permissão
                  </div>
                  <Badge
                    color={currentRole === "admin" ? C.gold : C.muted}
                    bg={
                      currentRole === "admin"
                        ? C.goldFaint
                        : "rgba(255,255,255,0.03)"
                    }
                    border={currentRole === "admin" ? C.borderGold : C.border}
                  >
                    {currentRole}
                  </Badge>
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={savingProfile || uploadingPhoto}
                className={savingProfile || uploadingPhoto ? "" : "gold-btn"}
                style={{
                  width: "100%",
                  marginTop: 20,
                  border: "none",
                  borderRadius: 16,
                  padding: "15px",
                  fontFamily: "DM Sans",
                  fontWeight: 800,
                  fontSize: 14,
                  color: C.obsidian,
                  background:
                    savingProfile || uploadingPhoto
                      ? "rgba(255,255,255,0.06)"
                      : undefined,
                  cursor:
                    savingProfile || uploadingPhoto ? "not-allowed" : "pointer",
                  opacity: savingProfile || uploadingPhoto ? 0.65 : 1,
                }}
              >
                {savingProfile ? "A guardar…" : "Guardar alterações"}
              </button>

              <button
                onClick={signOut}
                className="sans"
                style={{
                  width: "100%",
                  marginTop: 10,
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "13px",
                  fontWeight: 600,
                  fontSize: 13,
                  color: C.muted,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                Terminar sessão
              </button>

              {currentRole === "admin" && (
                <div
                  className="sans"
                  style={{
                    fontSize: 11,
                    color: C.gold,
                    marginTop: 14,
                    textAlign: "center",
                    padding: "10px",
                    background: C.goldFaint,
                    borderRadius: 10,
                    border: `1px solid ${C.borderGold}`,
                  }}
                >
                  ✦ Modo administrador activo
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom fade */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          maxWidth: "100%",
          height: 60,
          pointerEvents: "none",
          zIndex: 10,
          background: `linear-gradient(0deg, ${C.obsidian} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}
