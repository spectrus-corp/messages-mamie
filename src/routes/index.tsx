import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Messages pour Mamie" },
      { name: "description", content: "Des petits messages doux pour Mamie, à écouter quand elle veut." },
      { property: "og:title", content: "Messages pour Mamie" },
      { property: "og:description", content: "Des petits messages doux pour Mamie." },
    ],
  }),
  component: App,
});

type Role = "proche" | "admin";
type Screen = "home" | "setup" | "login" | "main";

interface Session {
  sessionId: string;
  prochePassword: string;
  adminPin: string;
  audios: Record<string, string>; // key -> base64 dataURL
}

interface AuthState {
  sessionId: string;
  role: Role;
}

const SESSION_KEY = "mamie:session";
const AUTH_KEY = "mamie:auth";

const BUTTONS = [
  { key: "bonjour", label: "Bonjour", emoji: "❤️", color: "from-[#f8e7f0] to-[#f4b8d4]" },
  { key: "bonne-nuit", label: "Bonne nuit", emoji: "🌙", color: "from-[#e8e0f0] to-[#c9b8e0]" },
  { key: "bisou", label: "Bisou", emoji: "😘", color: "from-[#fce4ec] to-[#f8bbd0]" },
  { key: "souvenir", label: "Souvenir", emoji: "💭", color: "from-[#f8f1e9] to-[#e8d5b9]" },
  { key: "blague", label: "Blague", emoji: "😂", color: "from-[#c8e6d0] to-[#8fc9a3]" },
];

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [role, setRole] = useState<Role>("proche");
  const [session, setSession] = useState<Session | null>(null);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = loadSession();
    const a = loadAuth();
    setSession(s);
    setAuth(a);
    if (a) setScreen("main");
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-[#fdf6f0]" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6f0] via-[#f8f1e9] to-[#f8e7f0] px-5 py-8">
      <div className="mx-auto max-w-md">
        {screen === "home" && (
          <Home
            onSelect={(r) => {
              setRole(r);
              setScreen(session ? "login" : "setup");
            }}
          />
        )}
        {screen === "setup" && (
          <Setup
            onDone={(s) => {
              localStorage.setItem(SESSION_KEY, JSON.stringify(s));
              setSession(s);
              setScreen("login");
            }}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "login" && session && (
          <Login
            role={role}
            session={session}
            onSuccess={() => {
              const a: AuthState = { sessionId: session.sessionId, role };
              localStorage.setItem(AUTH_KEY, JSON.stringify(a));
              setAuth(a);
              setScreen("main");
            }}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "main" && auth && session && (
          <Main
            auth={auth}
            session={session}
            onUpdate={(s) => {
              localStorage.setItem(SESSION_KEY, JSON.stringify(s));
              setSession(s);
            }}
          />
        )}
      </div>
    </div>
  );
}

function Home({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="flex flex-col items-center gap-10 pt-10 text-center">
      <div>
        <h1
          className="text-6xl leading-tight text-[#d27ba3] drop-shadow-sm"
          style={{ fontFamily: "Grand Hotel, cursive" }}
        >
          Messages
          <br />
          pour Mamie
        </h1>
        <p className="mt-4 text-lg text-[#8a7480]">Des petits mots doux à écouter ✨</p>
      </div>

      <div className="flex w-full flex-col gap-5">
        <button
          onClick={() => onSelect("proche")}
          className="w-full rounded-3xl bg-gradient-to-br from-[#f8e7f0] to-[#f4b8d4] px-6 py-7 text-2xl font-semibold text-[#7a3d5a] shadow-[0_8px_24px_rgba(244,184,212,0.4)] transition active:scale-95"
        >
          💝 Je suis un proche
        </button>
        <button
          onClick={() => onSelect("admin")}
          className="w-full rounded-3xl bg-gradient-to-br from-[#c8e6d0] to-[#8fc9a3] px-6 py-7 text-2xl font-semibold text-[#2d5a3d] shadow-[0_8px_24px_rgba(143,201,163,0.4)] transition active:scale-95"
        >
          👵 Je suis Moi (admin)
        </button>
      </div>
    </div>
  );
}

function PinInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="tel"
      inputMode="numeric"
      maxLength={4}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      className="w-full rounded-2xl border-2 border-[#f4b8d4]/40 bg-white/80 px-5 py-5 text-center text-3xl tracking-[0.8em] text-[#5a4a52] outline-none transition focus:border-[#f4b8d4]"
    />
  );
}

function Setup({ onDone, onBack }: { onDone: (s: Session) => void; onBack: () => void }) {
  const [sessionId, setSessionId] = useState("");
  const [proche, setProche] = useState("");
  const [admin, setAdmin] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (sessionId.length !== 4 || proche.length !== 4 || admin.length !== 4) {
      setErr("Tous les champs doivent contenir 4 chiffres.");
      return;
    }
    onDone({ sessionId, prochePassword: proche, adminPin: admin, audios: {} });
  };

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h2 className="text-4xl text-center text-[#d27ba3]" style={{ fontFamily: "Grand Hotel, cursive" }}>
        Créer la session
      </h2>
      <p className="text-center text-[#8a7480]">Choisis tes 3 codes (4 chiffres chacun)</p>

      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">N° de session</span>
        <PinInput value={sessionId} onChange={setSessionId} placeholder="••••" />
      </label>
      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">Mot de passe Proche</span>
        <PinInput value={proche} onChange={setProche} placeholder="••••" />
      </label>
      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">PIN Admin (Moi)</span>
        <PinInput value={admin} onChange={setAdmin} placeholder="••••" />
      </label>

      {err && <p className="text-center text-sm text-red-500">{err}</p>}

      <button
        onClick={submit}
        className="rounded-3xl bg-gradient-to-br from-[#c8e6d0] to-[#8fc9a3] px-6 py-5 text-xl font-semibold text-[#2d5a3d] shadow-lg active:scale-95"
      >
        Créer la session
      </button>
      <button onClick={onBack} className="text-[#8a7480] underline">
        Retour
      </button>
    </div>
  );
}

function Login({
  role,
  session,
  onSuccess,
  onBack,
}: {
  role: Role;
  session: Session;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [sessionId, setSessionId] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (sessionId !== session.sessionId) {
      setErr("N° de session incorrect.");
      return;
    }
    const expected = role === "proche" ? session.prochePassword : session.adminPin;
    if (code !== expected) {
      setErr("Code incorrect.");
      return;
    }
    onSuccess();
  };

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h2 className="text-4xl text-center text-[#d27ba3]" style={{ fontFamily: "Grand Hotel, cursive" }}>
        {role === "proche" ? "Bienvenue, proche 💝" : "Connexion Mamie 👵"}
      </h2>

      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">N° de session</span>
        <PinInput value={sessionId} onChange={setSessionId} placeholder="••••" />
      </label>
      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">
          {role === "proche" ? "Mot de passe" : "PIN Admin"}
        </span>
        <PinInput value={code} onChange={setCode} placeholder="••••" />
      </label>

      {err && <p className="text-center text-sm text-red-500">{err}</p>}

      <button
        onClick={submit}
        className="rounded-3xl bg-gradient-to-br from-[#f8e7f0] to-[#f4b8d4] px-6 py-5 text-xl font-semibold text-[#7a3d5a] shadow-lg active:scale-95"
      >
        Entrer
      </button>
      <button onClick={onBack} className="text-[#8a7480] underline">
        Retour
      </button>
    </div>
  );
}

function Main({
  auth,
  session,
  onUpdate,
}: {
  auth: AuthState;
  session: Session;
  onUpdate: (s: Session) => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (key: string) => {
    const src = session.audios[key];
    if (!src) {
      setToast("Aucun audio pour ce bouton pour l'instant 🌸");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const a = new Audio(src);
    audioRef.current = a;
    a.play().catch(() => setToast("Impossible de lire l'audio 😢"));
  };

  return (
    <div className="flex flex-col gap-5 pt-4">
      <div className="text-center">
        <h2
          className="text-5xl text-[#d27ba3]"
          style={{ fontFamily: "Grand Hotel, cursive" }}
        >
          Messages pour Mamie
        </h2>
        <p className="mt-1 text-sm text-[#8a7480]">
          {auth.role === "admin" ? "Mode Moi (admin) 👵" : "Mode proche 💝"}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {BUTTONS.map((b) => (
          <Row
            key={b.key}
            btn={b}
            hasAudio={!!session.audios[b.key]}
            isAdmin={auth.role === "admin"}
            onPlay={() => play(b.key)}
            onUpload={(dataUrl) => {
              const next = { ...session, audios: { ...session.audios, [b.key]: dataUrl } };
              onUpdate(next);
              setToast(`Audio "${b.label}" enregistré ✨`);
              setTimeout(() => setToast(null), 2500);
            }}
          />
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#5a4a52] px-6 py-3 text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Row({
  btn,
  hasAudio,
  isAdmin,
  onPlay,
  onUpload,
}: {
  btn: (typeof BUTTONS)[number];
  hasAudio: boolean;
  isAdmin: boolean;
  onPlay: () => void;
  onUpload: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onUpload(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-stretch gap-3">
      <button
        onClick={onPlay}
        className={`flex-1 rounded-3xl bg-gradient-to-br ${btn.color} px-5 py-6 text-left text-2xl font-semibold text-[#5a4a52] shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition active:scale-[0.98]`}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{btn.emoji}</span>
          <span>{btn.label}</span>
          {!hasAudio && !isAdmin && (
            <span className="ml-auto text-xs font-normal text-[#8a7480]">(vide)</span>
          )}
        </div>
      </button>
      {isAdmin && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-3xl bg-white/80 px-4 text-sm font-medium text-[#2d5a3d] shadow-md ring-1 ring-[#c8e6d0] active:scale-95"
          >
            🎙️
            <br />
            Changer
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.m4a,.wav,audio/*"
            onChange={handleFile}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
