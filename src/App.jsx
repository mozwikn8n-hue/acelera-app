import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  obsidian: "#07070E",
  deep: "#0D0D1A",
  card: "#141424",
  cardHover: "#1A1A30",
  border: "#22223A",
  borderGold: "rgba(201,168,76,0.25)",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDim: "#8B6914",
  goldGlow: "rgba(201,168,76,0.12)",
  goldGlow2: "rgba(201,168,76,0.06)",
  white: "#F2EDE4",
  offwhite: "#C8C2B8",
  muted: "#6A6A88",
  accent: "#5D56E8",
  accentGlow: "rgba(93,86,232,0.18)",
  success: "#3D9E76",
  danger: "#E8637A",
};

const LOGO_URL =
  "https://artjsvhhkusuoaifxcpl.supabase.co/storage/v1/object/sign/logo-acelera/WhatsApp%20Image%202026-05-09%20at%2017.43.46.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNGI5ZGM3Ny1iN2FhLTQwM2MtOGExZi0yNzQ1ZmY1ODQ4NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLWFjZWxlcmEvV2hhdHNBcHAgSW1hZ2UgMjAyNi0wNS0wOSBhdCAxNy40My40Ni5qcGVnIiwiaWF0IjoxNzc4MzQxNjY4LCJleHAiOjE4NDE0MTM2Njh9.4XliF9nN6m512YmixQgz2fULG9hN9muEDeR7bcOIbws";

const mockUser = {
  name: "Dádiva Gulele",
  course: "Acelera – Carreira Com Propósito",
  edition: "4.0",
  eventDate: "2026-07-01T00:00:00+02:00",
  eventMonthLabel: "Julho de 2026",
  avatar: "DG",
};

const COMMUNITY_SEED = [
  {
    id: 1,
    user: "Carlos M.",
    avatar: "CM",
    time: "há 2h",
    msg: "Já apliquei a técnica do módulo 1 no meu negócio. Resultados em 3 dias! 🔥",
    likes: 14,
    color: C.gold,
  },
  {
    id: 2,
    user: "Flávia T.",
    avatar: "FT",
    time: "há 4h",
    msg: "Alguém mais de Maputo que precisa de carona para o evento? Vamos organizar 😊",
    likes: 7,
    color: C.accent,
  },
  {
    id: 3,
    user: "Jorge A.",
    avatar: "JA",
    time: "há 6h",
    msg: "Dúvida: o certificado é enviado por email depois? Ainda aguardo resposta do suporte.",
    likes: 2,
    color: C.success,
  },
  {
    id: 4,
    user: "Nilza P.",
    avatar: "NP",
    time: "ontem",
    msg: "Módulo 2 mudou a forma como vejo o meu salão. Finalmente entendo o que me diferencia! 💅✨",
    likes: 21,
    color: C.danger,
  },
];

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

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date(targetDate);
    const tick = () => {
      const diff = target - new Date();
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

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ h = 60, radius = 12, mb = 10 }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: radius,
        marginBottom: mb,
        background: `linear-gradient(90deg, ${C.card} 25%, ${C.cardHover} 50%, ${C.card} 75%)`,
        backgroundSize: "200% 100%",
        animation: "skelShimmer 1.6s infinite",
      }}
    />
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState({});
  const [newMsg, setNewMsg] = useState("");
  const [posts, setPosts] = useState(COMMUNITY_SEED);
  const [expandedModule, setExpanded] = useState(null);

  // Supabase data
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadMod] = useState(true);
  const [eventInfo, setEventInfo] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loadingEvent, setLoadEvent] = useState(true);

  const countdown = useCountdown(eventInfo?.event_date || mockUser.eventDate);
  const completedModules = modules.filter((m) => m.completed).length;
  const progress =
    modules.length > 0
      ? Math.round((completedModules / modules.length) * 100)
      : 0;

  // Fetch modules
  useEffect(() => {
    (async () => {
      setLoadMod(true);
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("id", { ascending: true });
      if (!error) setModules(data || []);
      setLoadMod(false);
    })();
  }, []);

  // Fetch event data
  // Tabelas Supabase usadas:
  //   event_info  → title, venue, address, maps_link, event_month, event_date, description, active
  //   agenda      → time, title, type, active, position
  //   speakers    → name, role, topic, avatar, color
  useEffect(() => {
    (async () => {
      setLoadEvent(true);

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

      if (evRes.error) console.log("Erro event_info:", evRes.error);
      if (agRes.error) console.log("Erro agenda:", agRes.error);
      if (spRes.error) console.log("Erro speakers:", spRes.error);

      setLoadEvent(false);
    })();
  }, []);

  // Map URL — usa maps_link do Supabase ou faz fallback pelo endereço
  const mapUrl =
    eventInfo?.maps_link ||
    (eventInfo?.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          eventInfo.address
        )}`
      : `https://www.google.com/maps/search/?api=1&query=Hotel+Polana+Maputo`);

  const toggleLike = (id) => {
    setLiked((p) => ({ ...p, [id]: !p[id] }));
    setPosts((p) =>
      p.map((post) =>
        post.id === id
          ? { ...post, likes: post.likes + (liked[id] ? -1 : 1) }
          : post
      )
    );
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setPosts((p) => [
      {
        id: Date.now(),
        user: mockUser.name.split(" ")[0] + " N.",
        avatar: mockUser.avatar,
        time: "agora",
        msg: newMsg,
        likes: 0,
        color: C.gold,
      },
      ...p,
    ]);
    setNewMsg("");
  };

  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        background: C.obsidian,
        minHeight: "100vh",
        color: C.white,
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070E; }
        .dsp { font-family: 'Cormorant Garamond', Georgia, serif; }
        .sans { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 0; }

        .tab-in { animation: tabIn 0.4s cubic-bezier(0.22,1,0.36,1); }
        @keyframes tabIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .stagger > * { opacity:0; animation: tabIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        .stagger > *:nth-child(1){animation-delay:.05s}
        .stagger > *:nth-child(2){animation-delay:.10s}
        .stagger > *:nth-child(3){animation-delay:.15s}
        .stagger > *:nth-child(4){animation-delay:.20s}
        .stagger > *:nth-child(5){animation-delay:.25s}
        .stagger > *:nth-child(6){animation-delay:.30s}
        .stagger > *:nth-child(7){animation-delay:.35s}
        .stagger > *:nth-child(8){animation-delay:.40s}

        @keyframes skelShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .shimmer-ov {
          background: linear-gradient(105deg, transparent 35%, rgba(201,168,76,0.07) 50%, transparent 65%);
          background-size: 200% 100%;
          animation: shOv 3.5s infinite;
        }
        @keyframes shOv { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .dot-bg {
          background-image: radial-gradient(circle, rgba(201,168,76,0.055) 1px, transparent 1px);
          background-size: 18px 18px;
        }

        .pulse { animation: pulse 2.6s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.5)} 55%{box-shadow:0 0 0 9px rgba(201,168,76,0)} }

        .press { transition: transform 0.18s; cursor: pointer; }
        .press:active { transform: scale(0.975); }

        .nav-btn { transition: all 0.2s; }
        .nav-btn:hover { background: rgba(201,168,76,0.07) !important; }

        .map-btn { transition: all 0.22s; }
        .map-btn:hover { background: rgba(93,86,232,0.28) !important; transform: translateY(-1px); }
        .map-btn:active { transform: scale(0.97); }

        textarea:focus { border-color: rgba(201,168,76,0.45) !important; outline: none; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          background: `linear-gradient(180deg, #0D0D1A 0%, rgba(13,13,26,0.96) 100%)`,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          padding: "0 18px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 0 12px",
          }}
        >
          {/* Logo */}
          <img
            src={LOGO_URL}
            alt="Acelera"
            style={{
              width: 130,
              height: 40,
              objectFit: "contain",
              filter: "drop-shadow(0 0 14px rgba(201,168,76,0.2))",
            }}
          />

          {/* Course label */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              className="sans"
              style={{
                fontSize: 8,
                letterSpacing: 3,
                color: C.gold,
                textTransform: "uppercase",
              }}
            >
              Acesso Exclusivo
            </div>
            <div
              className="dsp"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: C.offwhite,
                lineHeight: 1.3,
              }}
            >
              {mockUser.course}{" "}
              <span style={{ color: C.gold }}>{mockUser.edition}</span>
            </div>
          </div>

          {/* Avatar */}
          <div
            className="pulse press"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              flexShrink: 0,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 13,
              color: C.obsidian,
            }}
          >
            {mockUser.avatar}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 2, paddingBottom: 10 }}>
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
                className="nav-btn"
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  background: active ? C.goldGlow : "transparent",
                  border: active
                    ? `1px solid rgba(201,168,76,0.28)`
                    : "1px solid transparent",
                  borderRadius: 8,
                  padding: "6px 2px",
                  cursor: "pointer",
                  color: active ? C.gold : C.muted,
                  fontSize: 9,
                  fontFamily: "DM Sans",
                  fontWeight: 500,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 13 }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main style={{ padding: "0 18px 120px" }}>
        {/* ══════════════════ HOME ══════════════════════════════════════════ */}
        {tab === "home" && (
          <div className="tab-in stagger">
            {/* Welcome */}
            <div style={{ padding: "28px 0 22px" }}>
              <div
                className="sans"
                style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}
              >
                Olá de volta,
              </div>
              <div
                className="dsp"
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginTop: 4,
                }}
              >
                {mockUser.name.split(" ")[0]}
                <span style={{ color: C.gold }}> ✦</span>
              </div>
              <div
                className="sans"
                style={{
                  fontSize: 13,
                  color: C.muted,
                  marginTop: 8,
                  lineHeight: 1.65,
                }}
              >
                A tua jornada de carreira começa aqui,
                <br />
                muito antes do dia do evento.
              </div>
            </div>

            {/* Countdown hero */}
            <div
              className="press"
              style={{
                background: `linear-gradient(135deg, #18152E 0%, #0E0D1C 55%, #0A0C1A 100%)`,
                border: `1px solid rgba(201,168,76,0.22)`,
                borderRadius: 22,
                padding: "22px 20px",
                marginBottom: 20,
                position: "relative",
                overflow: "hidden",
                boxShadow:
                  "0 0 0 1px rgba(201,168,76,0.1), 0 12px 48px rgba(201,168,76,0.07)",
              }}
            >
              <div
                className="shimmer-ov dot-bg"
                style={{ position: "absolute", inset: 0, borderRadius: 22 }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      className="sans"
                      style={{
                        fontSize: 8,
                        letterSpacing: 3,
                        color: C.gold,
                        textTransform: "uppercase",
                      }}
                    >
                      Contagem Regressiva
                    </div>
                    <div
                      className="dsp"
                      style={{
                        fontSize: 18,
                        color: C.offwhite,
                        marginTop: 3,
                        fontStyle: "italic",
                      }}
                    >
                      {eventInfo?.event_month || mockUser.eventMonthLabel}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(201,168,76,0.1)",
                      border: `1px solid rgba(201,168,76,0.22)`,
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontFamily: "DM Sans",
                      fontSize: 10,
                      color: C.gold,
                    }}
                  >
                    data provisória
                  </div>
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
                        background: "rgba(7,7,14,0.65)",
                        borderRadius: 14,
                        border: `1px solid rgba(201,168,76,0.1)`,
                        padding: "14px 4px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="dsp"
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: C.gold,
                          lineHeight: 1,
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
                          letterSpacing: 1.5,
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
                  }}
                >
                  <span style={{ fontSize: 12 }}>📍</span>
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
                borderRadius: 18,
                padding: "18px 20px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    className="sans"
                    style={{ fontSize: 13, fontWeight: 600, color: C.white }}
                  >
                    Preparação Pré-Evento
                  </div>
                  <div
                    className="sans"
                    style={{ fontSize: 11, color: C.muted, marginTop: 3 }}
                  >
                    {completedModules} de {modules.length} módulos concluídos
                  </div>
                </div>
                <div
                  className="dsp"
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: C.gold,
                    lineHeight: 1,
                  }}
                >
                  {progress}
                  <span style={{ fontSize: 18, color: C.goldDim }}>%</span>
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 99,
                  height: 4,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${C.goldDim}, ${C.gold}, ${C.goldLight})`,
                    borderRadius: 99,
                    transition: "width 1.4s cubic-bezier(0.22,1,0.36,1)",
                    boxShadow: `0 0 8px ${C.gold}55`,
                  }}
                />
              </div>
              {progress < 100 && (
                <div
                  className="sans"
                  style={{ fontSize: 11, color: C.muted, marginTop: 10 }}
                >
                  🔥 Continua — estás no bom caminho!
                </div>
              )}
            </div>

            {/* Speakers — só mostra se vier do Supabase */}
            {speakers.length > 0 && (
              <>
                <div
                  className="sans"
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: C.muted,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Quem vais encontrar
                </div>
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
                      className="press"
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: `${s.color || C.gold}16`,
                          border: `2px solid ${s.color || C.gold}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "DM Sans",
                          fontWeight: 700,
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
                      <div>
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
                          style={{ fontSize: 11, color: C.muted }}
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
                              marginTop: 3,
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

            {/* Quote */}
            <div
              style={{
                background: `linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(93,86,232,0.04) 100%)`,
                border: `1px solid rgba(201,168,76,0.14)`,
                borderRadius: 22,
                padding: "32px 26px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -10,
                  fontSize: 140,
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
                  fontSize: 21,
                  fontStyle: "italic",
                  color: C.white,
                  lineHeight: 1.65,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                "Não é o programa que muda a carreira, é a pessoa que decides
                tornar-te a partir dele."
              </div>
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    height: 1,
                    width: 28,
                    background: `rgba(201,168,76,0.3)`,
                  }}
                />
                <div
                  className="sans"
                  style={{
                    fontSize: 9,
                    letterSpacing: 2.5,
                    color: C.gold,
                    textTransform: "uppercase",
                  }}
                >
                  Acelera 4.0
                </div>
                <div
                  style={{
                    height: 1,
                    width: 28,
                    background: `rgba(201,168,76,0.3)`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ CONTENT ═══════════════════════════════════════ */}
        {tab === "content" && (
          <div className="tab-in">
            <div style={{ padding: "28px 0 20px" }}>
              <div
                className="dsp"
                style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.05 }}
              >
                Módulos <span style={{ color: C.gold }}>Pré-Evento</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 13, color: C.muted, marginTop: 6 }}
              >
                Prepara a tua mente antes de chegares.
              </div>
            </div>

            {loadingModules &&
              [1, 2, 3].map((i) => <Skeleton key={i} h={84} mb={10} />)}

            {!loadingModules && modules.length === 0 && (
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 20,
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
                return (
                  <div
                    key={m.id}
                    className="press"
                    onClick={() =>
                      unlocked && setExpanded(expanded ? null : m.id)
                    }
                    style={{
                      background: unlocked ? C.card : `${C.card}99`,
                      border: `1px solid ${
                        unlocked ? C.border : C.border + "55"
                      }`,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 10,
                      opacity: unlocked ? 1 : 0.55,
                      cursor: unlocked ? "pointer" : "default",
                      transition: "all 0.25s",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 14,
                          flexShrink: 0,
                          background: unlocked
                            ? C.goldGlow
                            : "rgba(255,255,255,0.03)",
                          border: `1px solid ${
                            unlocked ? C.borderGold : C.border
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                        }}
                      >
                        {m.icon || "▶"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
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
                            <span style={{ fontSize: 13 }}>🔒</span>
                          ) : (
                            <span
                              style={{
                                fontSize: 13,
                                color: C.muted,
                                display: "inline-block",
                                transform: expanded
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                                transition: "transform 0.25s",
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
                            lineHeight: 1.7,
                          }}
                        >
                          {m.teaser}
                        </div>
                        {m.content_link ? (
                          <a
                            href={m.content_link}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "block",
                              textAlign: "center",
                              marginTop: 14,
                              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                              borderRadius: 12,
                              padding: "13px",
                              fontFamily: "DM Sans",
                              fontWeight: 700,
                              fontSize: 14,
                              color: C.obsidian,
                              textDecoration: "none",
                              boxShadow: "0 4px 20px rgba(201,168,76,0.22)",
                            }}
                          >
                            ▶ Assistir Módulo
                          </a>
                        ) : (
                          <div
                            style={{
                              marginTop: 14,
                              background: "rgba(255,255,255,0.03)",
                              border: `1px solid ${C.border}`,
                              borderRadius: 12,
                              padding: 13,
                              textAlign: "center",
                              fontFamily: "DM Sans",
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
                          background: "rgba(255,255,255,0.025)",
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

            <div
              style={{
                background: C.accentGlow,
                border: `1px solid rgba(93,86,232,0.25)`,
                borderRadius: 14,
                padding: "16px 18px",
                marginTop: 10,
              }}
            >
              <div
                className="sans"
                style={{ fontSize: 12, color: "#A09BFF", lineHeight: 1.7 }}
              >
                🎁 <strong style={{ color: C.white }}>Bónus exclusivo:</strong>{" "}
                Quem completa os módulos disponíveis recebe materiais de apoio
                entregues no evento.
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ COMMUNITY ═════════════════════════════════════ */}
        {tab === "community" && (
          <div className="tab-in">
            <div style={{ padding: "28px 0 20px" }}>
              <div className="dsp" style={{ fontSize: 34, fontWeight: 700 }}>
                Comunidade <span style={{ color: C.gold }}>✦</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 13, color: C.muted, marginTop: 4 }}
              >
                {posts.length} participantes activos agora
              </div>
            </div>

            {/* Compose */}
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 16,
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "DM Sans",
                    fontWeight: 700,
                    fontSize: 12,
                    color: C.obsidian,
                  }}
                >
                  {mockUser.avatar}
                </div>
                <textarea
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Partilha uma ideia, dúvida ou conquista..."
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: C.white,
                    fontFamily: "DM Sans",
                    fontSize: 13,
                    resize: "none",
                    height: 78,
                    transition: "border 0.2s",
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
                <div className="sans" style={{ fontSize: 10, color: C.muted }}>
                  Visível para todos os participantes
                </div>
                <button
                  onClick={sendMsg}
                  style={{
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                    border: "none",
                    borderRadius: 10,
                    padding: "9px 20px",
                    fontFamily: "DM Sans",
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.obsidian,
                    cursor: "pointer",
                  }}
                >
                  Publicar
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="stagger">
              {posts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: `${p.color}16`,
                        border: `1px solid ${p.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "DM Sans",
                        fontWeight: 700,
                        fontSize: 12,
                        color: p.color,
                      }}
                    >
                      {p.avatar}
                    </div>
                    <div>
                      <div
                        className="sans"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.white,
                        }}
                      >
                        {p.user}
                      </div>
                      <div
                        className="sans"
                        style={{ fontSize: 10, color: C.muted }}
                      >
                        {p.time}
                      </div>
                    </div>
                  </div>
                  <div
                    className="sans"
                    style={{
                      fontSize: 13,
                      color: C.offwhite,
                      lineHeight: 1.65,
                    }}
                  >
                    {p.msg}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => toggleLike(p.id)}
                      style={{
                        background: liked[p.id] ? C.goldGlow2 : "transparent",
                        border: `1px solid ${
                          liked[p.id] ? C.borderGold : C.border
                        }`,
                        borderRadius: 20,
                        padding: "5px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: liked[p.id] ? C.gold : C.muted,
                        fontFamily: "DM Sans",
                        fontSize: 12,
                        transition: "all 0.2s",
                      }}
                    >
                      {liked[p.id] ? "♥" : "♡"} {p.likes}
                    </button>
                    <button
                      style={{
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        borderRadius: 20,
                        padding: "5px 14px",
                        cursor: "pointer",
                        color: C.muted,
                        fontFamily: "DM Sans",
                        fontSize: 12,
                      }}
                    >
                      Responder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════ EVENT ═════════════════════════════════════════
            Tabelas Supabase:
              event_info  → title, venue, address, maps_link, event_month, event_date, description, active
              agenda      → time, title, type, active, position
              speakers    → name, role, topic, avatar, color
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "event" && (
          <div className="tab-in">
            <div style={{ padding: "28px 0 20px" }}>
              <div className="dsp" style={{ fontSize: 34, fontWeight: 700 }}>
                O <span style={{ color: C.gold }}>Evento</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 13, color: C.muted, marginTop: 4 }}
              >
                Sabe o que te espera.
              </div>
            </div>

            {loadingEvent && (
              <>
                <Skeleton h={100} mb={14} />
                <Skeleton h={48} mb={10} />
                <Skeleton h={48} mb={10} />
                <Skeleton h={48} mb={10} />
                <Skeleton h={48} mb={10} />
              </>
            )}

            {!loadingEvent && (
              <div className="stagger">
                {/* Location */}
                <div
                  style={{
                    background: `linear-gradient(135deg, #14102A 0%, #0D0F20 100%)`,
                    border: `1px solid rgba(93,86,232,0.22)`,
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 18,
                    boxShadow:
                      "0 0 0 1px rgba(93,86,232,0.08), 0 10px 40px rgba(93,86,232,0.07)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 14,
                        flexShrink: 0,
                        background: C.accentGlow,
                        border: `1px solid rgba(93,86,232,0.25)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                      }}
                    >
                      📍
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        className="sans"
                        style={{
                          fontSize: 15,
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
                          style={{ fontSize: 11, color: C.gold, marginTop: 6 }}
                        >
                          📅{" "}
                          {eventInfo?.event_month ||
                            new Date(eventInfo.event_date).toLocaleDateString(
                              "pt-PT"
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Open Map button — clicável */}
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="map-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      marginTop: 16,
                      background: "rgba(93,86,232,0.15)",
                      border: `1px solid rgba(93,86,232,0.28)`,
                      borderRadius: 12,
                      padding: "12px",
                      fontFamily: "DM Sans",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#A09BFF",
                      textDecoration: "none",
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
                        marginTop: 14,
                        lineHeight: 1.65,
                      }}
                    >
                      {eventInfo.description}
                    </div>
                  )}
                </div>

                {/* Speakers */}
                {speakers.length > 0 && (
                  <>
                    <div
                      className="sans"
                      style={{
                        fontSize: 9,
                        letterSpacing: 3,
                        color: C.muted,
                        textTransform: "uppercase",
                        marginBottom: 12,
                      }}
                    >
                      Oradores
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        marginBottom: 18,
                      }}
                    >
                      {speakers.map((s, i) => (
                        <div
                          key={i}
                          className="press"
                          style={{
                            background: C.card,
                            border: `1px solid ${C.border}`,
                            borderRadius: 14,
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: `${s.color || C.gold}16`,
                              border: `2px solid ${s.color || C.gold}28`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "DM Sans",
                              fontWeight: 700,
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
                          <div>
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
                              style={{ fontSize: 11, color: C.muted }}
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
                                  marginTop: 3,
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
                    <div
                      className="sans"
                      style={{
                        fontSize: 9,
                        letterSpacing: 3,
                        color: C.muted,
                        textTransform: "uppercase",
                        marginBottom: 14,
                      }}
                    >
                      Agenda do Dia
                    </div>
                    <div style={{ position: "relative", marginBottom: 18 }}>
                      {/* timeline vertical line */}
                      <div
                        style={{
                          position: "absolute",
                          left: 44,
                          top: 6,
                          bottom: 6,
                          width: 1,
                          background: `linear-gradient(180deg, transparent, ${C.border} 8%, ${C.border} 92%, transparent)`,
                        }}
                      />

                      {agenda.map((a, i) => {
                        const dotColor = TYPE_COLORS[a.type] || C.muted;
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
                                paddingTop: 11,
                                flexShrink: 0,
                              }}
                            >
                              {a.time}
                            </div>
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: dotColor,
                                border: `2px solid ${C.obsidian}`,
                                flexShrink: 0,
                                marginTop: 11,
                                zIndex: 1,
                                boxShadow: `0 0 8px ${dotColor}55`,
                              }}
                            />
                            <div
                              style={{
                                flex: 1,
                                background: C.card,
                                border: `1px solid ${C.border}`,
                                borderRadius: 12,
                                padding: "10px 14px",
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
                                    background: dotColor,
                                  }}
                                />
                                <span
                                  className="sans"
                                  style={{
                                    fontSize: 9,
                                    color: dotColor,
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
                <div
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    className="sans"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.white,
                      marginBottom: 14,
                    }}
                  >
                    O que trazer 📋
                  </div>
                  {[
                    "Bilhete (este app funciona como bilhete)",
                    "Cartão de visita ou contacto digital",
                    "Bloco de notas — vais querer escrever muito",
                    "Mente aberta e vontade de crescer",
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: C.goldGlow,
                          border: `1px solid ${C.borderGold}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: C.gold,
                        }}
                      >
                        ✓
                      </div>
                      <div
                        className="sans"
                        style={{ fontSize: 12, color: C.offwhite }}
                      >
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom fade */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          height: 56,
          background: `linear-gradient(0deg, ${C.obsidian} 0%, transparent 100%)`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    </div>
  );
}
