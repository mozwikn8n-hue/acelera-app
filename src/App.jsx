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

const COURSE_INFO = {
  course: "Acelera – Carreira Com Propósito",
  edition: "4.0",
  eventDate: "2026-07-01T00:00:00+02:00",
  eventMonthLabel: "Julho de 2026",
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

const REACTION_EMOJIS = ["❤️", "🔥", "👏", "😂", "💡"];

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
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;

  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

function getProgressStage(progress) {
  if (progress >= 100) return "Pronta para Escalar";
  if (progress >= 75) return "Aceleradora";
  if (progress >= 50) return "Estratégica";
  if (progress >= 25) return "Em Movimento";
  return "Exploradora";
}

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

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitAuth = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Preenche o email e a senha.");
      return;
    }

    setLoading(true);

    const cleanedEmail = email.trim().toLowerCase();
    let result;

    if (mode === "signup") {
      result = await supabase.auth.signUp({
        email: cleanedEmail,
        password,
        options: {
          data: { name: name.trim() || cleanedEmail.split("@")[0] },
        },
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password,
      });
    }

    if (result.error) {
      alert(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        background: `radial-gradient(circle at top, rgba(201,168,76,0.14), transparent 34%), ${C.obsidian}`,
        minHeight: "100vh",
        color: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; }
        body { background: #07070E; }
        .dsp { font-family: 'Cormorant Garamond', Georgia, serif; }
        .sans { font-family: 'DM Sans', sans-serif; }
        input:focus { border-color: rgba(201,168,76,0.45) !important; outline: none; }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: `linear-gradient(180deg, ${C.cardHover} 0%, ${C.deep} 100%)`,
          border: `1px solid ${C.borderGold}`,
          borderRadius: 28,
          padding: 24,
          boxShadow: "0 24px 90px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src={LOGO_URL}
            alt="Acelera"
            style={{
              width: 230,
              maxWidth: "100%",
              height: 72,
              objectFit: "contain",
              filter: "drop-shadow(0 0 18px rgba(201,168,76,0.2))",
              marginBottom: 14,
            }}
          />
          <div
            className="sans"
            style={{
              fontSize: 10,
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
              fontSize: 30,
              fontWeight: 700,
              marginTop: 8,
              lineHeight: 1.1,
            }}
          >
            Acelera <span style={{ color: C.gold }}>4.0</span>
          </div>
          <div
            className="sans"
            style={{
              fontSize: 13,
              color: C.muted,
              marginTop: 8,
              lineHeight: 1.6,
            }}
          >
            Entra na tua área de preparação, comunidade e jornada pré-evento.
          </div>
        </div>

        <form
          onSubmit={submitAuth}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {mode === "signup" && (
            <div>
              <label
                className="sans"
                style={{
                  fontSize: 11,
                  color: C.muted,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.035)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "14px",
                  color: C.white,
                  fontFamily: "DM Sans",
                  fontSize: 14,
                }}
              />
            </div>
          )}

          <div>
            <label
              className="sans"
              style={{
                fontSize: 11,
                color: C.muted,
                display: "block",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="teuemail@exemplo.com"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.035)",
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "14px",
                color: C.white,
                fontFamily: "DM Sans",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              className="sans"
              style={{
                fontSize: 11,
                color: C.muted,
                display: "block",
                marginBottom: 6,
              }}
            >
              Senha
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="mínimo 6 caracteres"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.035)",
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "14px",
                color: C.white,
                fontFamily: "DM Sans",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 8,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              border: "none",
              borderRadius: 16,
              padding: "15px",
              fontFamily: "DM Sans",
              fontWeight: 800,
              fontSize: 14,
              color: C.obsidian,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading
              ? "A processar..."
              : mode === "signup"
              ? "Criar conta"
              : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          style={{
            width: "100%",
            marginTop: 16,
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "12px",
            color: C.offwhite,
            fontFamily: "DM Sans",
            cursor: "pointer",
          }}
        >
          {mode === "signup" ? "Já tenho conta" : "Criar nova conta"}
        </button>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [liked, setLiked] = useState({});
  const [newMsg, setNewMsg] = useState("");
  const [posts, setPosts] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [expandedModule, setExpanded] = useState(null);

  // Supabase data
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadMod] = useState(true);
  const [eventInfo, setEventInfo] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loadingEvent, setLoadEvent] = useState(true);

  // Profile data
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());

  const countdown = useCountdown(
    eventInfo?.event_date || COURSE_INFO.eventDate
  );
  const completedModules = completedModuleIds.size;
  const progress =
    modules.length > 0
      ? Math.round((completedModules / modules.length) * 100)
      : 0;
  const progressStage = getProgressStage(progress);

  const currentName =
    profile?.name ||
    authUser?.user_metadata?.name ||
    authUser?.email?.split("@")[0] ||
    "Participante";
  const currentEmail = profile?.email || authUser?.email || "";
  const currentRole = profile?.role || "user";
  const currentAvatar = profile?.avatar || initials(currentName);
  const currentAvatarIsImage =
    typeof currentAvatar === "string" && currentAvatar.startsWith("http");

  const ensureParticipantProfile = async () => {
    if (profile?.id) return profile;
    if (!authUser?.id) return null;

    const { data, error } = await supabase
      .from("participants")
      .insert({
        id: authUser.id,
        name: currentName,
        email: currentEmail,
        avatar: currentAvatarIsImage ? currentAvatar : null,
        progress: progress || 0,
        role: currentRole || "user",
      })
      .select()
      .single();

    if (error) {
      alert("Erro ao criar perfil: " + error.message);
      return null;
    }

    setProfile(data);
    return data;
  };

  const markModuleCompleted = async (module) => {
    if (!module?.id) return;

    const participant = await ensureParticipantProfile();
    if (!participant?.id) return;

    setCompletedModuleIds((prev) => {
      const next = new Set(prev);
      next.add(module.id);
      return next;
    });

    const { data: existing } = await supabase
      .from("module_progress")
      .select("id")
      .eq("participant_id", participant.id)
      .eq("module_id", module.id)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("module_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("module_progress").insert({
        participant_id: participant.id,
        module_id: module.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    const nextCompleted = new Set(completedModuleIds);
    nextCompleted.add(module.id);
    const nextProgress =
      modules.length > 0
        ? Math.round((nextCompleted.size / modules.length) * 100)
        : 0;

    await supabase
      .from("participants")
      .update({ progress: nextProgress })
      .eq("id", participant.id);

    setProfile((prev) => ({ ...prev, progress: nextProgress }));
  };

  const fetchCommunityPosts = async () => {
    setLoadingCommunity(true);

    const { data: rawPosts, error: postsError } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.log("Erro community_posts:", postsError);
      setPosts([]);
      setLoadingCommunity(false);
      return;
    }

    const postList = rawPosts || [];
    const postIds = postList.map((p) => p.id);
    const replyIds = [
      ...new Set(postList.map((p) => p.reply_to).filter(Boolean)),
    ];

    const [{ data: replyPosts }, { data: reactions }] = await Promise.all([
      replyIds.length
        ? supabase.from("community_posts").select("*").in("id", replyIds)
        : Promise.resolve({ data: [] }),
      postIds.length
        ? supabase
            .from("community_reactions")
            .select("*")
            .in("post_id", postIds)
        : Promise.resolve({ data: [] }),
    ]);

    const participantIds = [
      ...new Set(
        [...postList, ...(replyPosts || [])]
          .map((p) => p.participant_id)
          .filter(Boolean)
      ),
    ];

    const { data: participants } = participantIds.length
      ? await supabase
          .from("participants")
          .select("id,name,email,avatar,role")
          .in("id", participantIds)
      : { data: [] };

    const participantMap = new Map((participants || []).map((p) => [p.id, p]));
    const replyMap = new Map((replyPosts || []).map((p) => [p.id, p]));
    const reactionsByPost = new Map();

    (reactions || []).forEach((reaction) => {
      const list = reactionsByPost.get(reaction.post_id) || [];
      list.push(reaction);
      reactionsByPost.set(reaction.post_id, list);
    });

    const merged = postList.map((post) => {
      const author = participantMap.get(post.participant_id) || {};
      const postReactions = reactionsByPost.get(post.id) || [];
      const summary = postReactions.reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      }, {});
      const myReaction = profile?.id
        ? postReactions.find(
            (reaction) => reaction.participant_id === profile.id
          )
        : null;
      const repliedRaw = post.reply_to ? replyMap.get(post.reply_to) : null;
      const repliedAuthor = repliedRaw
        ? participantMap.get(repliedRaw.participant_id) || {}
        : null;

      return {
        ...post,
        author,
        reactions: postReactions,
        reactionSummary: summary,
        myReaction,
        repliedPost: repliedRaw
          ? {
              ...repliedRaw,
              author: repliedAuthor,
            }
          : null,
      };
    });

    setPosts(merged);
    setLoadingCommunity(false);
  };

  const scrollToPost = (postId) => {
    const el = document.getElementById(`post-${postId}`);
    if (!el) {
      alert("A mensagem original não está visível neste momento.");
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.boxShadow = `0 0 0 2px ${C.gold}, 0 0 36px rgba(201,168,76,0.28)`;
    setTimeout(() => {
      el.style.boxShadow = "";
    }, 1600);
  };

  const reactToPost = async (postId, emoji) => {
    const participant = await ensureParticipantProfile();
    if (!participant?.id) return;

    const { data: existing } = await supabase
      .from("community_reactions")
      .select("id, emoji")
      .eq("post_id", postId)
      .eq("participant_id", participant.id)
      .maybeSingle();

    if (existing?.id && existing.emoji === emoji) {
      await supabase.from("community_reactions").delete().eq("id", existing.id);
    } else if (existing?.id) {
      await supabase
        .from("community_reactions")
        .update({ emoji })
        .eq("id", existing.id);
    } else {
      await supabase.from("community_reactions").insert({
        post_id: postId,
        participant_id: participant.id,
        emoji,
      });
    }

    setReactionPickerFor(null);
    fetchCommunityPosts();
  };

  // Fetch profile
  useEffect(() => {
    if (!authUser?.id) {
      setProfile(null);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return;
      }

      const fallbackName =
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "Participante";

      const { data: created, error: createError } = await supabase
        .from("participants")
        .insert({
          id: authUser.id,
          name: fallbackName,
          email: authUser.email,
          avatar: null,
          progress: 0,
          role: "user",
        })
        .select()
        .single();

      if (!createError && created) {
        setProfile(created);
      } else {
        setProfile({
          id: authUser.id,
          name: fallbackName,
          email: authUser.email,
          avatar: null,
          progress: 0,
          role: "user",
        });
      }

      if (error) console.log("Erro participants:", error);
      if (createError) console.log("Erro ao criar participant:", createError);
    })();
  }, [authUser?.id]);

  // Fetch module progress for current participant
  useEffect(() => {
    if (!profile?.id) return;

    (async () => {
      const { data, error } = await supabase
        .from("module_progress")
        .select("module_id, completed")
        .eq("participant_id", profile.id)
        .eq("completed", true);

      if (!error && data) {
        setCompletedModuleIds(new Set(data.map((row) => row.module_id)));
      }

      if (error) console.log("Erro module_progress:", error);
    })();
  }, [profile?.id]);

  // Fetch community posts
  useEffect(() => {
    fetchCommunityPosts();
  }, [profile?.id]);

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

  const sendMsg = async () => {
    if (!newMsg.trim()) return;

    const participant = await ensureParticipantProfile();
    if (!participant?.id) return;

    const { error } = await supabase.from("community_posts").insert({
      participant_id: participant.id,
      message: newMsg.trim(),
      reply_to: replyingTo?.id || null,
    });

    if (error) {
      alert("Erro ao publicar: " + error.message);
      return;
    }

    setNewMsg("");
    setReplyingTo(null);
    fetchCommunityPosts();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingPhoto(true);

    const fileExt = file.name.split(".").pop();
    const safeEmail = currentEmail.replace(/[^a-zA-Z0-9]/g, "-");
    const filePath = `${safeEmail}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Erro ao carregar foto: " + uploadError.message);
      setUploadingPhoto(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl;

    setProfile((prev) => ({ ...prev, avatar: publicUrl }));
    setUploadingPhoto(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCompletedModuleIds(new Set());
    setPosts([]);
    setProfileOpen(false);
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

    let result;

    if (profile.id) {
      result = await supabase
        .from("participants")
        .update(payload)
        .eq("id", profile.id)
        .select()
        .single();
    } else {
      result = await supabase
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
    }

    if (result.error) {
      alert("Erro ao guardar perfil: " + result.error.message);
      setSavingProfile(false);
      return;
    }

    setProfile(result.data);
    setSavingProfile(false);
    setProfileOpen(false);
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.obsidian,
          color: C.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "DM Sans",
        }}
      >
        A carregar Acelera...
      </div>
    );
  }

  if (!session) return <AuthScreen />;

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
        input:focus { border-color: rgba(201,168,76,0.45) !important; outline: none; }
        .community-post { transition: box-shadow 0.35s, transform 0.18s; }
        .community-post:hover { transform: translateY(-1px); }
        .emoji-pill { transition: all 0.18s; }
        .emoji-pill:hover { transform: translateY(-2px) scale(1.05); }
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
              {COURSE_INFO.course}{" "}
              <span style={{ color: C.gold }}>{COURSE_INFO.edition}</span>
            </div>
          </div>

          {/* Avatar */}
          <button
            className="pulse press"
            onClick={() => setProfileOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              flexShrink: 0,
              background: currentAvatarIsImage
                ? `url(${currentAvatar}) center/cover`
                : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 13,
              color: C.obsidian,
            }}
            title="Abrir perfil"
          >
            {!currentAvatarIsImage && currentAvatar}
          </button>
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
                {currentName.split(" ")[0]}
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
                      {eventInfo?.event_month || COURSE_INFO.eventMonthLabel}
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
              <div
                style={{
                  marginTop: 14,
                  background: "rgba(201,168,76,0.06)",
                  border: `1px solid ${C.borderGold}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <div
                  className="sans"
                  style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}
                >
                  Nível da jornada
                </div>
                <div
                  className="dsp"
                  style={{ fontSize: 24, color: C.gold, fontWeight: 700 }}
                >
                  {progressStage}
                </div>
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
                          {completedModuleIds.has(m.id) && (
                            <span style={{ color: C.success, marginLeft: 8 }}>
                              ✓ Concluído
                            </span>
                          )}
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
                            onClick={() => markModuleCompleted(m)}
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
                {loadingCommunity
                  ? "A carregar conversas..."
                  : `${posts.length} mensagens da comunidade`}
              </div>
            </div>

            {/* Compose */}
            <div
              style={{
                background: `linear-gradient(135deg, ${C.card} 0%, ${C.cardHover} 100%)`,
                border: `1px solid ${C.borderGold}`,
                borderRadius: 18,
                padding: 16,
                marginBottom: 18,
                boxShadow: "0 12px 48px rgba(201,168,76,0.06)",
              }}
            >
              {replyingTo && (
                <div
                  style={{
                    background: "rgba(201,168,76,0.08)",
                    border: `1px solid ${C.borderGold}`,
                    borderRadius: 12,
                    padding: "10px 12px",
                    marginBottom: 12,
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
                      fontSize: 18,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: currentAvatarIsImage
                      ? `url(${currentAvatar}) center/cover`
                      : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "DM Sans",
                    fontWeight: 700,
                    fontSize: 12,
                    color: C.obsidian,
                  }}
                >
                  {!currentAvatarIsImage && currentAvatar}
                </div>
                <textarea
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder={
                    replyingTo
                      ? "Escreve a tua resposta..."
                      : "Partilha uma ideia, dúvida ou conquista..."
                  }
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "11px 12px",
                    color: C.white,
                    fontFamily: "DM Sans",
                    fontSize: 13,
                    resize: "none",
                    height: 86,
                    transition: "border 0.2s",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div className="sans" style={{ fontSize: 10, color: C.muted }}>
                  Conversa visível para participantes do Acelera.
                </div>
                <button
                  onClick={sendMsg}
                  disabled={!newMsg.trim()}
                  style={{
                    background: newMsg.trim()
                      ? `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`
                      : "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 18px",
                    fontFamily: "DM Sans",
                    fontWeight: 800,
                    fontSize: 13,
                    color: newMsg.trim() ? C.obsidian : C.muted,
                    cursor: newMsg.trim() ? "pointer" : "not-allowed",
                    whiteSpace: "nowrap",
                  }}
                >
                  {replyingTo ? "Responder" : "Publicar"}
                </button>
              </div>
            </div>

            {loadingCommunity && (
              <>
                <Skeleton h={120} mb={10} />
                <Skeleton h={120} mb={10} />
                <Skeleton h={120} mb={10} />
              </>
            )}

            {!loadingCommunity && posts.length === 0 && (
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 18,
                  padding: 22,
                  textAlign: "center",
                }}
              >
                <div className="dsp" style={{ fontSize: 24, color: C.gold }}>
                  Ainda está silencioso por aqui.
                </div>
                <div
                  className="sans"
                  style={{ fontSize: 13, color: C.muted, marginTop: 6 }}
                >
                  Sê a primeira pessoa a partilhar uma ideia com a comunidade.
                </div>
              </div>
            )}

            {/* Posts */}
            <div className="stagger">
              {posts.map((p) => {
                const authorName = p.author?.name || "Participante";
                const avatarValue = p.author?.avatar || initials(authorName);
                const avatarIsImage =
                  typeof avatarValue === "string" &&
                  avatarValue.startsWith("http");

                return (
                  <div
                    id={`post-${p.id}`}
                    key={p.id}
                    className="community-post"
                    style={{
                      background: `linear-gradient(135deg, ${C.card} 0%, ${C.deep} 100%)`,
                      border: `1px solid ${C.border}`,
                      borderRadius: 18,
                      padding: 16,
                      marginBottom: 12,
                      scrollMarginTop: 130,
                    }}
                  >
                    <div style={{ display: "flex", gap: 11, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: avatarIsImage
                            ? `url(${avatarValue}) center/cover`
                            : C.goldGlow,
                          border: `1px solid ${C.borderGold}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "DM Sans",
                          fontWeight: 800,
                          fontSize: 12,
                          color: C.gold,
                        }}
                      >
                        {!avatarIsImage && avatarValue}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 10,
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
                          {p.author?.role === "admin" && (
                            <span
                              className="sans"
                              style={{
                                border: `1px solid ${C.borderGold}`,
                                color: C.gold,
                                borderRadius: 999,
                                padding: "4px 8px",
                                fontSize: 9,
                                fontWeight: 800,
                                background: C.goldGlow,
                                textTransform: "uppercase",
                              }}
                            >
                              admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {p.repliedPost && (
                      <button
                        onClick={() => scrollToPost(p.repliedPost.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "rgba(201,168,76,0.07)",
                          border: `1px solid ${C.borderGold}`,
                          borderRadius: 12,
                          padding: "9px 11px",
                          marginBottom: 12,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          className="sans"
                          style={{
                            fontSize: 10,
                            color: C.gold,
                            fontWeight: 800,
                          }}
                        >
                          Em resposta a{" "}
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

                    <div
                      className="sans"
                      style={{
                        fontSize: 13,
                        color: C.offwhite,
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {p.message}
                    </div>

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
                              className="emoji-pill"
                              onClick={() => reactToPost(p.id, emoji)}
                              style={{
                                border: `1px solid ${
                                  p.myReaction?.emoji === emoji
                                    ? C.borderGold
                                    : C.border
                                }`,
                                background:
                                  p.myReaction?.emoji === emoji
                                    ? C.goldGlow
                                    : "rgba(255,255,255,0.03)",
                                color: C.offwhite,
                                borderRadius: 999,
                                padding: "5px 9px",
                                cursor: "pointer",
                                fontFamily: "DM Sans",
                                fontSize: 12,
                              }}
                            >
                              {emoji} {count}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 13,
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
                          padding: "6px 13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: p.myReaction ? C.gold : C.muted,
                          fontFamily: "DM Sans",
                          fontSize: 12,
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
                          padding: "6px 13px",
                          cursor: "pointer",
                          color: C.muted,
                          fontFamily: "DM Sans",
                          fontSize: 12,
                        }}
                      >
                        Responder
                      </button>

                      {reactionPickerFor === p.id && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            bottom: 38,
                            background: C.cardHover,
                            border: `1px solid ${C.borderGold}`,
                            borderRadius: 999,
                            padding: "8px 10px",
                            display: "flex",
                            gap: 8,
                            boxShadow: "0 14px 50px rgba(0,0,0,0.45)",
                            zIndex: 30,
                          }}
                        >
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              className="emoji-pill"
                              onClick={() => reactToPost(p.id, emoji)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                border: "none",
                                background:
                                  p.myReaction?.emoji === emoji
                                    ? C.goldGlow
                                    : "rgba(255,255,255,0.04)",
                                cursor: "pointer",
                                fontSize: 17,
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
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${dotColor}, ${C.white})`,
                                border: `3px solid ${C.obsidian}`,
                                flexShrink: 0,
                                marginTop: 10,
                                zIndex: 1,
                                boxShadow: `0 0 18px ${dotColor}`,
                              }}
                            />
                            <div
                              style={{
                                flex: 1,
                                background: `linear-gradient(135deg, ${C.card} 0%, ${C.cardHover} 100%)`,
                                border: `1px solid ${dotColor}30`,
                                borderRadius: 16,
                                padding: "14px 16px",
                                boxShadow: `0 0 22px ${dotColor}15`,
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

      {profileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.62)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 18,
          }}
          onClick={() => setProfileOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 430,
              background: `linear-gradient(180deg, ${C.cardHover} 0%, ${C.deep} 100%)`,
              border: `1px solid ${C.borderGold}`,
              borderRadius: 24,
              padding: 22,
              boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  className="dsp"
                  style={{ fontSize: 28, fontWeight: 700, color: C.white }}
                >
                  Meu Perfil
                </div>
                <div
                  className="sans"
                  style={{ fontSize: 12, color: C.muted, marginTop: 2 }}
                >
                  Actualiza apenas os teus dados.
                </div>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: `1px solid ${C.border}`,
                  background: "rgba(255,255,255,0.03)",
                  color: C.offwhite,
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: currentAvatarIsImage
                    ? `url(${currentAvatar}) center/cover`
                    : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                  border: `2px solid ${C.borderGold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "DM Sans",
                  fontWeight: 800,
                  fontSize: 20,
                  color: C.obsidian,
                  flexShrink: 0,
                }}
              >
                {!currentAvatarIsImage && currentAvatar}
              </div>

              <div style={{ flex: 1 }}>
                <label
                  className="sans"
                  style={{
                    display: "inline-block",
                    background: C.goldGlow,
                    border: `1px solid ${C.borderGold}`,
                    color: C.gold,
                    borderRadius: 12,
                    padding: "9px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {uploadingPhoto ? "A carregar..." : "Alterar foto"}
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
                    lineHeight: 1.5,
                  }}
                >
                  A foto será enviada para o Supabase Storage e o link ficará
                  guardado no teu perfil.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label
                  className="sans"
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nome
                </label>
                <input
                  value={profile?.name || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.035)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "13px 14px",
                    color: C.white,
                    fontFamily: "DM Sans",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  className="sans"
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <div
                  className="sans"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "13px 14px",
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  {currentEmail}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 13,
                  }}
                >
                  <div
                    className="sans"
                    style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}
                  >
                    Progresso
                  </div>
                  <div
                    className="dsp"
                    style={{ fontSize: 26, color: C.gold, lineHeight: 1 }}
                  >
                    {progress}%
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 13,
                  }}
                >
                  <div
                    className="sans"
                    style={{ fontSize: 10, color: C.muted, marginBottom: 7 }}
                  >
                    Permissão
                  </div>
                  <span
                    className="sans"
                    style={{
                      display: "inline-block",
                      borderRadius: 999,
                      padding: "5px 10px",
                      background:
                        currentRole === "admin"
                          ? C.goldGlow
                          : "rgba(255,255,255,0.035)",
                      border: `1px solid ${
                        currentRole === "admin" ? C.borderGold : C.border
                      }`,
                      color: currentRole === "admin" ? C.gold : C.muted,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {currentRole}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={savingProfile || uploadingPhoto}
              style={{
                width: "100%",
                marginTop: 18,
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                border: "none",
                borderRadius: 14,
                padding: "14px",
                fontFamily: "DM Sans",
                fontWeight: 800,
                fontSize: 14,
                color: C.obsidian,
                cursor:
                  savingProfile || uploadingPhoto ? "not-allowed" : "pointer",
                opacity: savingProfile || uploadingPhoto ? 0.7 : 1,
              }}
            >
              {savingProfile ? "A guardar..." : "Guardar alterações"}
            </button>

            <button
              onClick={signOut}
              style={{
                width: "100%",
                marginTop: 10,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "12px",
                fontFamily: "DM Sans",
                fontWeight: 700,
                fontSize: 13,
                color: C.muted,
                cursor: "pointer",
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
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                Modo administrador activo. A gestão de outros perfis será
                adicionada numa próxima etapa.
              </div>
            )}
          </div>
        </div>
      )}

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
