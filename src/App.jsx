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

const fallbackModules = [
  {
    id: 1,
    title: "Autoconhecimento & Direcção de Carreira",
    unlocked: true,
    completed: true,
    icon: "✦",
    teaser: "Começa por reconhecer quem és, onde estás e que tipo de crescimento faz sentido para ti.",
    duration: "45 min",
    content_link: "",
  },
  {
    id: 2,
    title: "Plano de Carreira com Propósito",
    unlocked: true,
    completed: false,
    icon: "◈",
    teaser: "Transforma ambição em acções concretas, alinhadas com estratégia, autenticidade e propósito.",
    duration: "60 min",
    content_link: "",
  },
  {
    id: 3,
    title: "Liderança & Efeito Multiplicador",
    unlocked: false,
    completed: false,
    icon: "◉",
    teaser: "Desbloqueado em breve...",
    duration: "55 min",
    content_link: "",
  },
];

const community = [
  { id: 1, user: "Carlos M.", avatar: "CM", time: "há 2h", msg: "Já comecei a rever o meu plano de carreira. Esta jornada promete! 🔥", likes: 14, color: "#C9A84C" },
  { id: 2, user: "Flávia T.", avatar: "FT", time: "há 4h", msg: "Alguém mais de Maputo inscrito no Acelera 4.0? Vamos criar conexões antes do programa 😊", likes: 7, color: "#6C63FF" },
  { id: 3, user: "Jorge A.", avatar: "JA", time: "há 6h", msg: "Gostei muito da proposta de carreira com propósito. Ansioso pelas sessões.", likes: 2, color: "#4CAF8C" },
  { id: 4, user: "Nilza P.", avatar: "NP", time: "ontem", msg: "Sinto que este programa chegou no momento certo da minha carreira ✨", likes: 21, color: "#E8637A" },
];

const fallbackSpeakers = [
  { id: "glayds-gand", name: "Glayds Gand", role: "Mentora · Acelera 4.0", topic: "Carreira com Propósito", avatar: "GG", color: "#C9A84C" },
];

const agenda = [
  { time: "08:30", title: "Chegada & Networking", type: "network" },
  { time: "09:00", title: "Abertura — Uma Nova Jornada", type: "keynote" },
  { time: "10:00", title: "Sessão: Autoconhecimento & Carreira", type: "panel" },
  { time: "11:30", title: "Pausa Café & Conexões", type: "break" },
  { time: "12:00", title: "Workshop: Plano de Carreira", type: "workshop" },
  { time: "14:00", title: "Almoço Executivo", type: "break" },
  { time: "15:30", title: "Liderança — Efeito Multiplicador", type: "case" },
  { time: "17:00", title: "Sessão Q&A + Próximos Passos", type: "qa" },
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

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isModuleUnlocked(module) {
  return module.unlocked || !module.unlock_date || new Date(module.unlock_date) <= new Date();
}

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
  const [modules, setModules] = useState(fallbackModules);
  const [speakers, setSpeakers] = useState(fallbackSpeakers);
  const [loadingModules, setLoadingModules] = useState(true);

  const userAvatar = mockUser.avatar || getInitials(mockUser.name);
  const countdown = useCountdown(mockUser.eventDate);
  const completedModules = modules.filter((m) => m.completed).length;
  const progress = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;
  const displayedSpeakers = speakers.length > 0 ? speakers : fallbackSpeakers;

  useEffect(() => {
    async function fetchModules() {
      setLoadingModules(true);

      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        setModules(data);
      }

      setLoadingModules(false);
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
        user: mockUser.name.split(" ")[0] + " G.",
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
    <div style={{ fontFamily: "'Georgia', serif", background: COLORS.obsidian, minHeight: "100vh", color: COLORS.white, maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" }}>
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

      <div style={{ background: `linear-gradient(180deg, ${COLORS.deep} 0%, transparent 100%)`, padding: "20px 20px 0", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
            <div className="serif" style={{ fontSize: 11, color: COLORS.gold, letterSpacing: 3, textTransform: "uppercase" }}>Acesso Exclusivo</div>
            <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: COLORS.white, lineHeight: 1.2 }}>
              {mockUser.course} <span style={{ color: COLORS.gold }}>{mockUser.edition}</span>
            </div>
          </div>
          <div className="pulse-ring" style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.gold}, #8B6914)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans", fontWeight: 700, fontSize: 14, color: COLORS.obsidian, cursor: "pointer" }}>
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
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: tab === t.id ? COLORS.goldGlow : "transparent", border: tab === t.id ? `1px solid rgba(201,168,76,0.3)` : "1px solid transparent", borderRadius: 8, padding: "6px 4px", cursor: "pointer", color: tab === t.id ? COLORS.gold : COLORS.muted, fontSize: 10, fontFamily: "DM Sans", fontWeight: 500, transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
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
              <div className="sans" style={{ fontSize: 13, color: COLORS.muted }}>Olá de volta,</div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 900, color: COLORS.white, lineHeight: 1.1 }}>
                {mockUser.name.split(" ")[0]} <span style={{ color: COLORS.gold }}>✦</span>
              </div>
              <div className="sans" style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>A tua jornada começa antes do programa.</div>
            </div>

            <div style={{ background: `linear-gradient(135deg, #1A1628 0%, #0F0F1A 100%)`, border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 16, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }} className="glow-gold">
              <div className="shimmer" style={{ position: "absolute", inset: 0, borderRadius: 16 }} />
              <div className="sans" style={{ fontSize: 11, color: COLORS.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Contagem Regressiva</div>
              <div className="sans" style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Data provisória: {mockUser.eventMonthLabel}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[["d", "Dias"], ["h", "Horas"], ["m", "Min"], ["s", "Seg"]].map(([k, label]) => (
                  <div key={k} style={{ textAlign: "center", background: COLORS.card, borderRadius: 10, padding: "10px 4px" }}>
                    <div className="serif" style={{ fontSize: 28, fontWeight: 900, color: COLORS.gold, lineHeight: 1 }}>{String(countdown[k]).padStart(2, "0")}</div>
                    <div className="sans" style={{ fontSize: 9, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="sans" style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, textAlign: "center" }}>📍 Maputo · Programa Acelera 4.0</div>
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div className="sans" style={{ fontSize: 13, fontWeight: 500 }}>Preparação Pré-Programa</div>
                <div className="serif" style={{ fontSize: 18, color: COLORS.gold, fontWeight: 700 }}>{progress}%</div>
              </div>
              <div style={{ background: COLORS.border, borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`, borderRadius: 99, transition: "width 1s ease" }} />
              </div>
              <div className="sans" style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>{completedModules} de {modules.length} módulos concluídos · continua assim 🔥</div>
            </div>

            <div className="sans" style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Quem vais encontrar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {displayedSpeakers.map((s, i) => (
                <div key={i} className="card-hover" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${s.color}33, ${s.color}66)`, border: `2px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans", fontWeight: 700, fontSize: 13, color: s.color, flexShrink: 0 }}>{s.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div className="sans" style={{ fontSize: 13, fontWeight: 600, color: COLORS.white }}>{s.name}</div>
                    <div className="sans" style={{ fontSize: 11, color: COLORS.muted }}>{s.role}</div>
                    <div className="sans" style={{ fontSize: 11, color: s.color, marginTop: 2 }}>"{s.topic}"</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${COLORS.goldGlow}, transparent)`, border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 16, padding: 20, textAlign: "center" }}>
              <div className="serif" style={{ fontSize: 18, fontStyle: "italic", color: COLORS.white, lineHeight: 1.5 }}>"Não é apenas sobre crescer na carreira, é sobre crescer com direcção."</div>
              <div className="sans" style={{ fontSize: 11, color: COLORS.gold, marginTop: 8, letterSpacing: 1 }}>— Acelera 4.0</div>
            </div>
          </div>
        )}

        {tab === "content" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>Módulos <span style={{ color: COLORS.gold }}>Pré-Programa</span></div>
              <div className="sans" style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{loadingModules ? "A carregar conteúdos..." : "Prepara a tua mente antes de chegares."}</div>
            </div>

            {modules.map((module) => {
              const isUnlocked = isModuleUnlocked(module);

              return (
                <div key={module.id} className="card-hover" onClick={() => isUnlocked && setExpandedModule(expandedModule === module.id ? null : module.id)} style={{ background: isUnlocked ? COLORS.card : `${COLORS.card}88`, border: `1px solid ${isUnlocked ? COLORS.border : COLORS.border + "55"}`, borderRadius: 14, padding: 16, marginBottom: 10, opacity: isUnlocked ? 1 : 0.6, cursor: isUnlocked ? "pointer" : "default", transition: "all 0.25s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: isUnlocked ? COLORS.goldGlow : COLORS.surface, border: `1px solid ${isUnlocked ? COLORS.gold + "44" : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{module.icon || "✦"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="sans" style={{ fontSize: 14, fontWeight: 600, color: isUnlocked ? COLORS.white : COLORS.muted }}>{module.title}</div>
                        {!isUnlocked && <span style={{ fontSize: 14 }}>🔒</span>}
                      </div>
                      <div className="sans" style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>{module.duration}</div>
                    </div>
                  </div>

                  {isUnlocked && expandedModule === module.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
                      <div className="sans" style={{ fontSize: 13, color: COLORS.white, lineHeight: 1.6 }}>{module.teaser}</div>
                      {module.content_link ? (
                        <a href={module.content_link} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", marginTop: 12, width: "100%", background: `linear-gradient(135deg, ${COLORS.gold}, #8B6914)`, borderRadius: 10, padding: "12px", fontFamily: "DM Sans", fontWeight: 700, fontSize: 14, color: COLORS.obsidian, textDecoration: "none" }}>▶ Assistir Módulo</a>
                      ) : (
                        <button style={{ marginTop: 12, width: "100%", background: `linear-gradient(135deg, ${COLORS.gold}, #8B6914)`, border: "none", borderRadius: 10, padding: "12px", fontFamily: "DM Sans", fontWeight: 700, fontSize: 14, color: COLORS.obsidian, cursor: "pointer" }}>▶ Assistir Módulo</button>
                      )}
                    </div>
                  )}

                  {!isUnlocked && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: COLORS.surface, borderRadius: 8 }}>
                      <div className="sans" style={{ fontSize: 12, color: COLORS.muted }}>{module.teaser || "Este conteúdo será desbloqueado em breve."}</div>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ background: COLORS.accentGlow, border: `1px solid rgba(108,99,255,0.3)`, borderRadius: 14, padding: 16, marginTop: 8 }}>
              <div className="sans" style={{ fontSize: 12, color: "#9B94FF", lineHeight: 1.6 }}>🎁 <strong style={{ color: COLORS.white }}>Bónus exclusivo:</strong> acompanha os conteúdos, participa nas sessões e constrói um plano de carreira com mais clareza.</div>
            </div>
          </div>
        )}

        {tab === "community" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>Comunidade <span style={{ color: COLORS.gold }}>✦</span></div>
              <div className="sans" style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{posts.length} participantes activos agora</div>
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <textarea value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Partilha uma ideia, dúvida ou conquista..." style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.white, fontFamily: "DM Sans", fontSize: 13, resize: "none", height: 80, transition: "border 0.2s" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <div className="sans" style={{ fontSize: 11, color: COLORS.muted }}>Visível para todos os participantes</div>
                <button onClick={sendMsg} style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #8B6914)`, border: "none", borderRadius: 8, padding: "8px 18px", fontFamily: "DM Sans", fontWeight: 700, fontSize: 13, color: COLORS.obsidian, cursor: "pointer" }}>Publicar</button>
              </div>
            </div>

            {posts.map((p) => (
              <div key={p.id} className="card-hover" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${p.color}22`, border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans", fontWeight: 700, fontSize: 12, color: p.color, flexShrink: 0 }}>{p.avatar}</div>
                  <div>
                    <div className="sans" style={{ fontSize: 13, fontWeight: 600 }}>{p.user}</div>
                    <div className="sans" style={{ fontSize: 11, color: COLORS.muted }}>{p.time}</div>
                  </div>
                </div>
                <div className="sans" style={{ fontSize: 13, color: COLORS.white, lineHeight: 1.6 }}>{p.msg}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                  <button onClick={() => toggleLike(p.id)} style={{ background: liked[p.id] ? COLORS.goldGlow : "transparent", border: `1px solid ${liked[p.id] ? COLORS.gold + "44" : COLORS.border}`, borderRadius: 20, padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: liked[p.id] ? COLORS.gold : COLORS.muted, fontFamily: "DM Sans", fontSize: 12, transition: "all 0.2s" }}>{liked[p.id] ? "♥" : "♡"} {p.likes}</button>
                  <button style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "4px 12px", cursor: "pointer", color: COLORS.muted, fontFamily: "DM Sans", fontSize: 12 }}>Responder</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "event" && (
          <div className="tab-content">
            <div style={{ padding: "20px 0 16px" }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>O <span style={{ color: COLORS.gold }}>Programa</span></div>
              <div className="sans" style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Sabe o que te espera.</div>
            </div>

            <div style={{ background: `linear-gradient(135deg, #1A1628, #0F1420)`, border: `1px solid rgba(108,99,255,0.3)`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📍</div>
                <div>
                  <div className="sans" style={{ fontSize: 14, fontWeight: 600 }}>Acelera — Carreira Com Propósito</div>
                  <div className="sans" style={{ fontSize: 12, color: COLORS.muted }}>Maputo · Julho de 2026</div>
                  <div className="sans" style={{ fontSize: 12, color: "#9B94FF", marginTop: 2 }}>Detalhes em confirmação →</div>
                </div>
              </div>
            </div>

            <div className="sans" style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Agenda do Dia</div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 42, top: 0, bottom: 0, width: 1, background: COLORS.border }} />
              {agenda.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div className="sans" style={{ fontSize: 11, color: COLORS.muted, width: 36, textAlign: "right", paddingTop: 10, flexShrink: 0 }}>{a.time}</div>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: typeColors[a.type], border: `2px solid ${COLORS.obsidian}`, flexShrink: 0, marginTop: 10, zIndex: 1 }} />
                  <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px" }}>
                    <div className="sans" style={{ fontSize: 13, fontWeight: 500, color: COLORS.white }}>{a.title}</div>
                    <div style={{ width: 6, height: 6, borderRadius: 99, background: typeColors[a.type], display: "inline-block", marginTop: 4 }} />
                    <span className="sans" style={{ fontSize: 10, color: typeColors[a.type], marginLeft: 5, textTransform: "capitalize" }}>{a.type}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginTop: 8 }}>
              <div className="sans" style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>O que trazer 📋</div>
              {["Vontade de crescer com propósito", "Perguntas sobre a tua carreira", "Bloco de notas ou contacto digital", "Mente aberta para uma nova jornada"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.goldGlow, border: `1px solid ${COLORS.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: COLORS.gold, flexShrink: 0 }}>✓</div>
                  <div className="sans" style={{ fontSize: 12, color: COLORS.muted }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 20, background: COLORS.obsidian }} />
    </div>
  );
}
