import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const COLORS = {
  obsidian: "#0A0A0F",
  deep: "#0F0F1A",
  surface: "#16162A",
  card: "#1C1C32",
  border: "#2A2A4A",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldGlow: "rgba(201,168,76,0.15)",
  white: "#F5F0E8",
  muted: "#8888AA",
  accent: "#6C63FF",
  accentGlow: "rgba(108,99,255,0.2)",
  success: "#4CAF8C",
};

const mockUser = {
  name: "Dádiva Gulele",
  course: "Acelera – Carreira Com Propósito",
  edition: "4.0",
  eventMonthLabel: "Julho de 2026",
  eventDate: "2026-07-01T00:00:00+02:00",
  avatar: "",
};

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const community = [
  {
    id: 1,
    user: "Carlos M.",
    avatar: "CM",
    time: "há 2h",
    msg: "Já apliquei a técnica do módulo 1 no meu negócio. Resultados em 3 dias! 🔥",
    likes: 14,
    color: "#C9A84C",
  },
  {
    id: 2,
    user: "Flávia T.",
    avatar: "FT",
    time: "há 4h",
    msg: "Alguém mais de Maputo que precisa de carona para o evento? Vamos organizar 😊",
    likes: 7,
    color: "#6C63FF",
  },
  {
    id: 3,
    user: "Jorge A.",
    avatar: "JA",
    time: "há 6h",
    msg: "Dúvida: o certificado é enviado por email depois? Perguntei no suporte mas ainda aguardo.",
    likes: 2,
    color: "#4CAF8C",
  },
  {
    id: 4,
    user: "Nilza P.",
    avatar: "NP",
    time: "ontem",
    msg: "Módulo 2 mudou a forma como vejo o meu salão. Finalmente entendo o que me diferencia! 💅✨",
    likes: 21,
    color: "#E8637A",
  },
];

const fallbackSpeakers = [
  {
    id: "glayds-gand",
    name: "Glayds Gand",
    role: "Mentora · Acelera 4.0",
    topic: "Carreira com Propósito",
    avatar: "GG",
    color: "#C9A84C",
  },
];

const agenda = [
  { time: "08:30", title: "Chegada & Networking", type: "network" },
  { time: "09:00", title: "Abertura — A Visão do Evento", type: "keynote" },
  { time: "10:00", title: "Painel: Mentalidade de Escala", type: "panel" },
  { time: "11:30", title: "Pausa Café & Conexões", type: "break" },
  {
    time: "12:00",
    title: "Workshop: Posicionamento ao Vivo",
    type: "workshop",
  },
  { time: "14:00", title: "Almoço Executivo", type: "break" },
  { time: "15:30", title: "Cases Reais de Moçambique", type: "case" },
  { time: "17:00", title: "Sessão Q&A + Desafio 30 Dias", type: "qa" },
  { time: "18:00", title: "Networking Final & Encerramento", type: "close" },
];

const typeColors = {
  keynote: "#C9A84C",
  panel: "#6C63FF",
  workshop: "#4CAF8C",
  network: "#E8637A",
  break: "#8888AA",
  case: "#FF9F43",
  qa: "#C9A84C",
  close: "#6C63FF",
};

// Countdown
function useCountdown(targetDate) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(targetDate);

    const tick = () => {
      const now = new Date();
      const diff = target - now;

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
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [targetDate]);

  return time;
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState({});
  const [newMsg, setNewMsg] = useState("");
  const [posts, setPosts] = useState(community);
  const [expandedModule, setExpandedModule] = useState(null);

  // ✅ CORRIGIDO: useState declarados apenas uma vez, dentro do componente
  const [speakers, setSpeakers] = useState([]);
  const [modules, setModules] = useState([]);

  const userAvatar = mockUser.avatar || getInitials(mockUser.name);
  const countdown = useCountdown(mockUser.eventDate);

  const completedModules = modules.filter((m) => m.completed).length;
  const progress =
    modules.length > 0
      ? Math.round((completedModules / modules.length) * 100)
      : 0;
  const displayedSpeakers = speakers.length > 0 ? speakers : fallbackSpeakers;

  useEffect(() => {
    async function fetchModules() {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("active", true)
        .order("id", { ascending: true });

      if (error) {
        console.log("Erro modules:", error);
        return;
      }

      setModules(data);
    }

    fetchModules();
  }, []);

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
        avatar: userAvatar,
        time: "agora",
        msg: newMsg,
        likes: 0,
        color: "#C9A84C",
      },
      ...p,
    ]);
    setNewMsg("");
  };

  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        background: COLORS.obsidian,
        minHeight: "100vh",
        color: COLORS.white,
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0F; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .sans { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 0; }
        .tab-content { animation: fadeUp 0.35s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
        @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.4);} 50%{box-shadow:0 0 0 12px rgba(201,168,76,0);} }
        .shimmer { background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.08) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 2.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:active { transform: scale(0.98); }
        .glow-gold { box-shadow: 0 0 20px rgba(201,168,76,0.2); }
        input, textarea { outline: none; }
        textarea:focus { border-color: rgba(201,168,76,0.5) !important; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${COLORS.deep} 0%, transparent 100%)`,
          padding: "20px 20px 0",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 16,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div>
            <img
              src="https://artjsvhhkusuoaifxcpl.supabase.co/storage/v1/object/sign/logo-acelera/WhatsApp%20Image%202026-05-09%20at%2017.43.46.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNGI5ZGM3Ny1iN2FhLTQwM2MtOGExZi0yNzQ1ZmY1ODQ4NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLWFjZWxlcmEvV2hhdHNBcHAgSW1hZ2UgMjAyNi0wNS0wOSBhdCAxNy40My40Ni5qcGVnIiwiaWF0IjoxNzc4MzQxNjY4LCJleHAiOjE4NDE0MTM2Njh9.4XliF9nN6m512YmixQgz2fULG9hN9muEDeR7bcOIbws"
              alt="Acelera"
              style={{
                width: "100%",
                maxWidth: 500,
                height: "auto",
                margin: "0 auto 20px",
                objectFit: "contain",
                display: "block",
              }}
            />
            <div
              className="serif"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.white,
                lineHeight: 1.2,
              }}
            >
              {mockUser.course}{" "}
              <span style={{ color: COLORS.gold }}>{mockUser.edition}</span>
            </div>
          </div>
          <div
            className="pulse-ring"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.gold}, #8B6914)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 14,
              color: COLORS.obsidian,
              cursor: "pointer",
            }}
          >
            {userAvatar}
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 4, padding: "8px 0" }}>
          {[
            { id: "home", icon: "✦", label: "Início" },
            { id: "content", icon: "▶", label: "Conteúdo" },
            { id: "community", icon: "◈", label: "Comunidade" },
            { id: "event", icon: "◉", label: "Evento" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: tab === t.id ? COLORS.goldGlow : "transparent",
                border:
                  tab === t.id
                    ? `1px solid rgba(201,168,76,0.3)`
                    : "1px solid transparent",
                borderRadius: 8,
                padding: "6px 4px",
                cursor: "pointer",
                color: tab === t.id ? COLORS.gold : COLORS.muted,
                fontSize: 10,
                fontFamily: "DM Sans",
                fontWeight: 500,
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: "0 16px 100px", overflow: "auto" }}>
        {/* HOME TAB */}
        {tab === "home" && (
          <div className="tab-content">
            {/* Welcome */}
            <div style={{ padding: "20px 0 16px" }}>
              <div
                className="sans"
                style={{ fontSize: 13, color: COLORS.muted }}
              >
                Olá de volta,
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: COLORS.white,
                  lineHeight: 1.1,
                }}
              >
                {mockUser.name.split(" ")[0]}{" "}
                <span style={{ color: COLORS.gold }}>✦</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}
              >
                A tua jornada começa antes do evento.
              </div>
            </div>

            {/* Countdown card */}
            <div
              style={{
                background: `linear-gradient(135deg, #1A1628 0%, #0F0F1A 100%)`,
                border: `1px solid rgba(201,168,76,0.3)`,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                position: "relative",
                overflow: "hidden",
              }}
              className="glow-gold"
            >
              <div
                className="shimmer"
                style={{ position: "absolute", inset: 0, borderRadius: 16 }}
              />
              <div
                className="sans"
                style={{
                  fontSize: 11,
                  color: COLORS.gold,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Contagem Regressiva
              </div>
              <div
                className="sans"
                style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}
              >
                Data provisória: {mockUser.eventMonthLabel}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
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
                      textAlign: "center",
                      background: COLORS.card,
                      borderRadius: 10,
                      padding: "10px 4px",
                    }}
                  >
                    <div
                      className="serif"
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: COLORS.gold,
                        lineHeight: 1,
                      }}
                    >
                      {String(countdown[k]).padStart(2, "0")}
                    </div>
                    <div
                      className="sans"
                      style={{
                        fontSize: 9,
                        color: COLORS.muted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginTop: 2,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="sans"
                style={{
                  fontSize: 12,
                  color: COLORS.muted,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                📍 Hotel Polana · Maputo · Sala Grandes Nomes
              </div>
            </div>

            {/* Progress */}
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div className="sans" style={{ fontSize: 13, fontWeight: 500 }}>
                  Preparação Pré-Evento
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 18, color: COLORS.gold, fontWeight: 700 }}
                >
                  {String(progress).padStart(2, "0")}%
                </div>
              </div>
              <div
                style={{
                  background: COLORS.border,
                  borderRadius: 99,
                  height: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${String(progress).padStart(2, "0")}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                    borderRadius: 99,
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <div
                className="sans"
                style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}
              >
                {completedModules} de {modules.length} módulos concluídos ·
                continua assim 🔥
              </div>
            </div>

            {/* Speakers preview */}
            <div
              className="sans"
              style={{
                fontSize: 12,
                color: COLORS.muted,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Quem vais encontrar
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {displayedSpeakers.map((s, i) => (
                <div
                  key={i}
                  className="card-hover"
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${s.color}33, ${s.color}66)`,
                      border: `2px solid ${s.color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "DM Sans",
                      fontWeight: 700,
                      fontSize: 13,
                      color: s.color,
                      flexShrink: 0,
                    }}
                  >
                    {s.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      className="sans"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: COLORS.white,
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      className="sans"
                      style={{ fontSize: 11, color: COLORS.muted }}
                    >
                      {s.role}
                    </div>
                    <div
                      className="sans"
                      style={{ fontSize: 11, color: s.color, marginTop: 2 }}
                    >
                      "{s.topic}"
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hype quote */}
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.goldGlow}, transparent)`,
                border: `1px solid rgba(201,168,76,0.2)`,
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
              }}
            >
              <div
                className="serif"
                style={{
                  fontSize: 18,
                  fontStyle: "italic",
                  color: COLORS.white,
                  lineHeight: 1.5,
                }}
              >
                "Não é o evento que muda o negócio, é a pessoa que sais de lá."
              </div>
              <div
                className="sans"
                style={{
                  fontSize: 11,
                  color: COLORS.gold,
                  marginTop: 8,
                  letterSpacing: 1,
                }}
              >
                Acelera – Carreira Com Propósito 4.0
              </div>
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {tab === "content" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>
                Módulos <span style={{ color: COLORS.gold }}>Pré-Evento</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}
              >
                Prepara a tua mente antes de chegares.
              </div>
            </div>
            {modules.map((m, i) => (
              <div
                key={m.id}
                className="card-hover"
                onClick={() =>
                  m.unlocked &&
                  setExpandedModule(expandedModule === m.id ? null : m.id)
                }
                style={{
                  background: m.unlocked ? COLORS.card : `${COLORS.card}88`,
                  border: `1px solid ${
                    m.unlocked ? COLORS.border : COLORS.border + "55"
                  }`,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  opacity: m.unlocked ? 1 : 0.6,
                  cursor: m.unlocked ? "pointer" : "default",
                  transition: "all 0.25s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: m.unlocked ? COLORS.goldGlow : COLORS.surface,
                      border: `1px solid ${
                        m.unlocked ? COLORS.gold + "44" : COLORS.border
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {m.icon}
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
                          color: m.unlocked ? COLORS.white : COLORS.muted,
                        }}
                      >
                        {m.title}
                      </div>
                      {!m.unlocked && <span style={{ fontSize: 14 }}>🔒</span>}
                    </div>
                    <div
                      className="sans"
                      style={{
                        fontSize: 11,
                        color: COLORS.muted,
                        marginTop: 3,
                      }}
                    >
                      {m.duration}
                    </div>
                  </div>
                </div>
                {m.unlocked && expandedModule === m.id && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      className="sans"
                      style={{
                        fontSize: 13,
                        color: COLORS.white,
                        lineHeight: 1.6,
                      }}
                    >
                      {m.teaser}
                    </div>
                    <button
                      style={{
                        marginTop: 12,
                        width: "100%",
                        background: `linear-gradient(135deg, ${COLORS.gold}, #8B6914)`,
                        border: "none",
                        borderRadius: 10,
                        padding: "12px",
                        fontFamily: "DM Sans",
                        fontWeight: 700,
                        fontSize: 14,
                        color: COLORS.obsidian,
                        cursor: "pointer",
                      }}
                    >
                      ▶ Assistir Módulo
                    </button>
                  </div>
                )}
                {!m.unlocked && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 12px",
                      background: COLORS.surface,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      className="sans"
                      style={{ fontSize: 12, color: COLORS.muted }}
                    >
                      {m.teaser}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div
              style={{
                background: COLORS.accentGlow,
                border: `1px solid rgba(108,99,255,0.3)`,
                borderRadius: 14,
                padding: 16,
                marginTop: 8,
              }}
            >
              <div
                className="sans"
                style={{ fontSize: 12, color: "#9B94FF", lineHeight: 1.6 }}
              >
                🎁{" "}
                <strong style={{ color: COLORS.white }}>
                  Bónus exclusivo:
                </strong>{" "}
                Quem completa os 2 módulos disponíveis recebe um workbook
                impresso entregue no evento.
              </div>
            </div>
          </div>
        )}

        {/* COMMUNITY TAB */}
        {tab === "community" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>
                Comunidade <span style={{ color: COLORS.gold }}>✦</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}
              >
                {posts.length} participantes activos agora
              </div>
            </div>

            {/* Post input */}
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <textarea
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Partilha uma ideia, dúvida ou conquista..."
                style={{
                  width: "100%",
                  background: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: COLORS.white,
                  fontFamily: "DM Sans",
                  fontSize: 13,
                  resize: "none",
                  height: 80,
                  transition: "border 0.2s",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <div
                  className="sans"
                  style={{ fontSize: 11, color: COLORS.muted }}
                >
                  Visível para todos os participantes
                </div>
                <button
                  onClick={sendMsg}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gold}, #8B6914)`,
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 18px",
                    fontFamily: "DM Sans",
                    fontWeight: 700,
                    fontSize: 13,
                    color: COLORS.obsidian,
                    cursor: "pointer",
                  }}
                >
                  Publicar
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.map((p) => (
              <div
                key={p.id}
                className="card-hover"
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: `${p.color}22`,
                      border: `1px solid ${p.color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "DM Sans",
                      fontWeight: 700,
                      fontSize: 12,
                      color: p.color,
                      flexShrink: 0,
                    }}
                  >
                    {p.avatar}
                  </div>
                  <div>
                    <div
                      className="sans"
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      {p.user}
                    </div>
                    <div
                      className="sans"
                      style={{ fontSize: 11, color: COLORS.muted }}
                    >
                      {p.time}
                    </div>
                  </div>
                </div>
                <div
                  className="sans"
                  style={{ fontSize: 13, color: COLORS.white, lineHeight: 1.6 }}
                >
                  {p.msg}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 10,
                  }}
                >
                  <button
                    onClick={() => toggleLike(p.id)}
                    style={{
                      background: liked[p.id] ? COLORS.goldGlow : "transparent",
                      border: `1px solid ${
                        liked[p.id] ? COLORS.gold + "44" : COLORS.border
                      }`,
                      borderRadius: 20,
                      padding: "4px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      color: liked[p.id] ? COLORS.gold : COLORS.muted,
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
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 20,
                      padding: "4px 12px",
                      cursor: "pointer",
                      color: COLORS.muted,
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
        )}

        {/* EVENT TAB */}
        {tab === "event" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>
                O <span style={{ color: COLORS.gold }}>Evento</span>
              </div>
              <div
                className="sans"
                style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}
              >
                Sabe o que te espera.
              </div>
            </div>

            {/* Location card */}
            <div
              style={{
                background: `linear-gradient(135deg, #1A1628, #0F1420)`,
                border: `1px solid rgba(108,99,255,0.3)`,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: COLORS.accentGlow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  📍
                </div>
                <div>
                  <div
                    className="sans"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Hotel Polana — Sala Grandes Nomes
                  </div>
                  <div
                    className="sans"
                    style={{ fontSize: 12, color: COLORS.muted }}
                  >
                    Av. Julius Nyerere, Maputo
                  </div>
                  <div
                    className="sans"
                    style={{ fontSize: 12, color: "#9B94FF", marginTop: 2 }}
                  >
                    Ver no mapa →
                  </div>
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div
              className="sans"
              style={{
                fontSize: 12,
                color: COLORS.muted,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Agenda do Dia
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 42,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: COLORS.border,
                }}
              />
              {agenda.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    className="sans"
                    style={{
                      fontSize: 11,
                      color: COLORS.muted,
                      width: 36,
                      textAlign: "right",
                      paddingTop: 10,
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
                      background: typeColors[a.type],
                      border: `2px solid ${COLORS.obsidian}`,
                      flexShrink: 0,
                      marginTop: 10,
                      zIndex: 1,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      background: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 10,
                      padding: "8px 12px",
                    }}
                  >
                    <div
                      className="sans"
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: COLORS.white,
                      }}
                    >
                      {a.title}
                    </div>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 99,
                        background: typeColors[a.type],
                        display: "inline-block",
                        marginTop: 4,
                      }}
                    />
                    <span
                      className="sans"
                      style={{
                        fontSize: 10,
                        color: typeColors[a.type],
                        marginLeft: 5,
                        textTransform: "capitalize",
                      }}
                    >
                      {a.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* What to bring */}
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: 16,
                marginTop: 8,
              }}
            >
              <div
                className="sans"
                style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}
              >
                O que trazer 📋
              </div>
              {[
                "Bilhete (este app funciona como bilhete)",
                "Cartão de visita ou contacto digital",
                "Bloco de notas — vai querer escrever muito",
                "Mente aberta e sede de crescer",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: COLORS.goldGlow,
                      border: `1px solid ${COLORS.gold}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: COLORS.gold,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <div
                    className="sans"
                    style={{ fontSize: 12, color: COLORS.muted }}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div style={{ height: 20, background: COLORS.obsidian }} />
    </div>
  );
}
