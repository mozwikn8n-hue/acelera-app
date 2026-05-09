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

const modules = [
  {
    id: 1,
    title: "Autoconhecimento & Dicas Práticas de Aceleração de Carreira",
    unlocked: true,
    completed: false,
    icon: "🧭",
    teaser:
      "Uma sessão para reconhecer pontos fortes, desafios e caminhos de crescimento.",
    duration: "60 min",
  },
  {
    id: 2,
    title: "Assessment de Carreira & Plano de Médio Prazo",
    unlocked: true,
    completed: false,
    icon: "📌",
    teaser:
      "Organiza decisões, prioridades e metas profissionais com mais clareza.",
    duration: "75 min",
  },
  {
    id: 3,
    title: "Liderança – Efeito Multiplicador",
    unlocked: false,
    completed: false,
    icon: "✨",
    teaser: "Desbloqueado durante a jornada.",
    duration: "60 min",
  },
];

const community = [
  {
    id: 1,
    user: "Glayds G.",
    avatar: "GG",
    time: "agora",
    msg: "Bem-vindas ao Acelera 4.0. Esta jornada será sobre propósito, estratégia e crescimento consciente.",
    likes: 0,
    color: "#C9A84C",
  },
];

const agenda = [
  { time: "08:30", title: "Chegada & Networking", type: "network" },
  { time: "09:00", title: "Abertura da Jornada Acelera 4.0", type: "keynote" },
  {
    time: "10:00",
    title: "Sessão 1: Autoconhecimento & Carreira",
    type: "workshop",
  },
  { time: "12:00", title: "Intervalo & Conexões", type: "break" },
  { time: "14:00", title: "Sessão 2: Plano de Carreira", type: "workshop" },
  {
    time: "16:00",
    title: "Sessão 3: Liderança e Efeito Multiplicador",
    type: "panel",
  },
];

const typeColors = {
  keynote: "#C9A84C",
  panel: "#6C63FF",
  workshop: "#4CAF8C",
  network: "#E8637A",
  break: "#8888AA",
};

const fallbackSpeakers = [
  {
    id: "fallback-1",
    name: "Glayds Gand",
    role: "Mentora · Acelera 4.0",
    topic: "Carreira com Propósito",
    avatar: "GG",
    color: "#C9A84C",
  },
];

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
  const [speakers, setSpeakers] = useState([]);

  const userAvatar = mockUser.avatar || getInitials(mockUser.name);
  const countdown = useCountdown(mockUser.eventDate);

  const completedModules = modules.filter((m) => m.completed).length;
  const progress =
    modules.length > 0
      ? Math.round((completedModules / modules.length) * 100)
      : 0;

  const displayedSpeakers = speakers.length > 0 ? speakers : fallbackSpeakers;

  useEffect(() => {
    async function fetchSpeakers() {
      const { data, error } = await supabase.from("speakers").select("*");

      if (error) {
        console.log("Erro ao buscar speakers:", error);
        return;
      }

      setSpeakers(data || []);
    }

    fetchSpeakers();
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
      `}</style>

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
            }}
          >
            {userAvatar}
          </div>
        </div>

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

      <div style={{ padding: "0 16px 100px", overflow: "auto" }}>
        {tab === "home" && (
          <div className="tab-content">
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
            >
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
                style={{
                  fontSize: 12,
                  color: COLORS.muted,
                  marginBottom: 12,
                }}
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
            </div>

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
                    width: `${progress}%`,
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
                {completedModules} de {modules.length} módulos concluídos
              </div>
            </div>

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
                  key={s.id || i}
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
                      background: `${s.color || COLORS.gold}22`,
                      border: `2px solid ${s.color || COLORS.gold}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "DM Sans",
                      fontWeight: 700,
                      fontSize: 13,
                      color: s.color || COLORS.gold,
                    }}
                  >
                    {s.avatar || "GG"}
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
                      style={{
                        fontSize: 11,
                        color: s.color || COLORS.gold,
                        marginTop: 2,
                      }}
                    >
                      "{s.topic}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "content" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>
                Módulos <span style={{ color: COLORS.gold }}>Pré-Evento</span>
              </div>
            </div>

            {modules.map((m) => (
              <div
                key={m.id}
                onClick={() =>
                  m.unlocked &&
                  setExpandedModule(expandedModule === m.id ? null : m.id)
                }
                style={{
                  background: m.unlocked ? COLORS.card : `${COLORS.card}88`,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  opacity: m.unlocked ? 1 : 0.6,
                  cursor: m.unlocked ? "pointer" : "default",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{m.icon}</div>
                  <div>
                    <div
                      className="sans"
                      style={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {m.title}
                    </div>
                    <div
                      className="sans"
                      style={{ fontSize: 11, color: COLORS.muted }}
                    >
                      {m.duration}
                    </div>
                  </div>
                </div>

                {expandedModule === m.id && (
                  <div
                    className="sans"
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: `1px solid ${COLORS.border}`,
                      fontSize: 13,
                    }}
                  >
                    {m.teaser}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "community" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>
                Comunidade
              </div>
            </div>

            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Partilha uma ideia, dúvida ou conquista..."
              style={{
                width: "100%",
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: 12,
                color: COLORS.white,
                fontFamily: "DM Sans",
                fontSize: 13,
                resize: "none",
                height: 80,
              }}
            />

            <button
              onClick={sendMsg}
              style={{
                marginTop: 10,
                background: COLORS.gold,
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 700,
                color: COLORS.obsidian,
              }}
            >
              Publicar
            </button>

            {posts.map((p) => (
              <div
                key={p.id}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 14,
                  padding: 14,
                  marginTop: 10,
                }}
              >
                <div className="sans" style={{ fontSize: 13, fontWeight: 600 }}>
                  {p.avatar} · {p.user}
                </div>
                <div className="sans" style={{ fontSize: 13, marginTop: 8 }}>
                  {p.msg}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "event" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>
                O Evento
              </div>
            </div>

            {agenda.map((a, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 10,
                }}
              >
                <div
                  className="sans"
                  style={{ fontSize: 11, color: COLORS.muted }}
                >
                  {a.time}
                </div>
                <div className="sans" style={{ fontSize: 13 }}>
                  {a.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
