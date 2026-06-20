import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Messages de famille" },
      { name: "description", content: "Des petits messages audio doux à écouter, pour rester proches." },
      { property: "og:title", content: "Messages de famille" },
      { property: "og:description", content: "Des petits messages audio doux à écouter, pour rester proches." },
    ],
  }),
  component: App,
});

type Role = "proche" | "admin";
type Screen = "home" | "setup" | "login" | "main" | "settings";

interface ButtonDef {
  key: string;
  label: string;
  emoji: string;
}

interface Session {
  sessionId: string;
  prochePassword: string;
  adminPin: string;
  recipientName: string; // ex: "Mamie", "Papa", "Tata Lou"
  buttons: ButtonDef[];
  audios: Record<string, string>;
}

interface AuthState {
  sessionId: string;
  role: Role;
}

const SESSION_KEY = "famille:session";
const AUTH_KEY = "famille:auth";

const DEFAULT_BUTTONS: ButtonDef[] = [
  { key: "bonjour", label: "Bonjour", emoji: "❤️" },
  { key: "bonne-nuit", label: "Bonne nuit", emoji: "🌙" },
  { key: "bisou", label: "Bisou", emoji: "😘" },
  { key: "souvenir", label: "Souvenir", emoji: "💭" },
  { key: "blague", label: "Blague", emoji: "😂" },
];

const BUTTON_COLORS = [
  "from-[#f8e7f0] to-[#f4b8d4]",
  "from-[#e8e0f0] to-[#c9b8e0]",
  "from-[#fce4ec] to-[#f8bbd0]",
  "from-[#f8f1e9] to-[#e8d5b9]",
  "from-[#c8e6d0] to-[#8fc9a3]",
];

function loadJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function normalizeSession(s: Session): Session {
  return {
    ...s,
    recipientName: s.recipientName ?? "",
    buttons: s.buttons && s.buttons.length ? s.buttons : DEFAULT_BUTTONS,
    audios: s.audios ?? {},
  };
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [role, setRole] = useState<Role>("proche");
  const [session, setSession] = useState<Session | null>(null);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = loadJSON<Session>(SESSION_KEY);
    const a = loadJSON<AuthState>(AUTH_KEY);
    if (s) setSession(normalizeSession(s));
    setAuth(a);
    if (a) setScreen("main");
    setReady(true);
  }, []);

  const saveSession = (s: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  if (!ready) return <div className="min-h-screen bg-[#fdf6f0]" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6f0] via-[#f8f1e9] to-[#f8e7f0] px-5 py-8 pb-12">
      <div className="mx-auto max-w-md">
        {screen === "home" && (
          <Home
            recipient={session?.recipientName}
            onSelect={(r) => {
              setRole(r);
              setScreen(session ? "login" : "setup");
            }}
          />
        )}
        {screen === "setup" && (
          <Setup
            onDone={(s) => {
              saveSession(s);
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
            onUpdate={saveSession}
            onOpenSettings={() => setScreen("settings")}
          />
        )}
        {screen === "settings" && auth && session && auth.role === "admin" && (
          <Settings
            session={session}
            onSave={(s) => {
              saveSession(s);
              setScreen("main");
            }}
            onBack={() => setScreen("main")}
          />
        )}
      </div>
    </div>
  );
}

function Home({ recipient, onSelect }: { recipient?: string; onSelect: (r: Role) => void }) {
  const name = recipient?.trim();
  return (
    <div className="flex flex-col items-center gap-10 pt-10 text-center">
      <div>
        <h1
          className="text-6xl leading-tight text-[#d27ba3] drop-shadow-sm"
          style={{ fontFamily: "Grand Hotel, cursive" }}
        >
          Messages
          <br />
          {name ? `pour ${name}` : "de famille"}
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
          🌿 {name ? `C'est moi, ${name}` : "Je suis le destinataire"}
        </button>
      </div>

      <p className="text-xs text-[#a89099] max-w-xs">
        Astuce : pour installer l'app, ouvre ce site sur ton téléphone puis « Ajouter à l'écran d'accueil ».
      </p>
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
  const [recipientName, setRecipientName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [proche, setProche] = useState("");
  const [admin, setAdmin] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!recipientName.trim()) {
      setErr("Donne un prénom au destinataire.");
      return;
    }
    if (sessionId.length !== 4 || proche.length !== 4 || admin.length !== 4) {
      setErr("Tous les codes doivent contenir 4 chiffres.");
      return;
    }
    onDone({
      sessionId,
      prochePassword: proche,
      adminPin: admin,
      recipientName: recipientName.trim(),
      buttons: DEFAULT_BUTTONS,
      audios: {},
    });
  };

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h2 className="text-4xl text-center text-[#d27ba3]" style={{ fontFamily: "Grand Hotel, cursive" }}>
        Créer la session
      </h2>
      <p className="text-center text-[#8a7480]">Une seule fois sur ce téléphone.</p>

      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">
          Prénom du destinataire (ex : Mamie, Papi, Maman…)
        </span>
        <input
          type="text"
          maxLength={20}
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Mamie"
          className="w-full rounded-2xl border-2 border-[#f4b8d4]/40 bg-white/80 px-5 py-4 text-center text-2xl text-[#5a4a52] outline-none focus:border-[#f4b8d4]"
        />
      </label>
      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">N° de session</span>
        <PinInput value={sessionId} onChange={setSessionId} placeholder="••••" />
      </label>
      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">Mot de passe Proche</span>
        <PinInput value={proche} onChange={setProche} placeholder="••••" />
      </label>
      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">PIN du destinataire</span>
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
        {role === "proche"
          ? "Bienvenue 💝"
          : session.recipientName
            ? `Bonjour ${session.recipientName} 🌿`
            : "Bienvenue 🌿"}
      </h2>

      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">N° de session</span>
        <PinInput value={sessionId} onChange={setSessionId} placeholder="••••" />
      </label>
      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">
          {role === "proche" ? "Mot de passe" : "PIN"}
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
  onOpenSettings,
}: {
  auth: AuthState;
  session: Session;
  onUpdate: (s: Session) => void;
  onOpenSettings: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const play = (key: string) => {
    const src = session.audios[key];
    if (!src) {
      showToast("Pas encore d'audio pour ce bouton 🌸");
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(src);
    audioRef.current = a;
    a.play().catch(() => showToast("Impossible de lire l'audio 😢"));
  };

  const title = session.recipientName
    ? `Messages pour ${session.recipientName}`
    : "Messages de famille";

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="text-center">
        <h2
          className="text-5xl text-[#d27ba3] leading-tight"
          style={{ fontFamily: "Grand Hotel, cursive" }}
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#8a7480]">
          {auth.role === "admin" ? "Mode destinataire 🌿" : "Mode proche 💝"}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {session.buttons.map((b, i) => (
          <Row
            key={b.key}
            btn={b}
            color={BUTTON_COLORS[i % BUTTON_COLORS.length]}
            hasAudio={!!session.audios[b.key]}
            isAdmin={auth.role === "admin"}
            onPlay={() => play(b.key)}
            onUpload={(dataUrl) => {
              onUpdate({ ...session, audios: { ...session.audios, [b.key]: dataUrl } });
              showToast(`Audio « ${b.label} » enregistré ✨`);
            }}
          />
        ))}
      </div>

      {auth.role === "admin" && (
        <button
          onClick={onOpenSettings}
          className="mt-2 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-[#5a4a52] shadow ring-1 ring-[#e8d5b9]"
        >
          ⚙️ Personnaliser les boutons
        </button>
      )}

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
  color,
  hasAudio,
  isAdmin,
  onPlay,
  onUpload,
}: {
  btn: ButtonDef;
  color: string;
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
        className={`flex-1 rounded-3xl bg-gradient-to-br ${color} px-5 py-6 text-left text-2xl font-semibold text-[#5a4a52] shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition active:scale-[0.98]`}
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
            className="rounded-3xl bg-white/80 px-4 text-xs font-medium text-[#2d5a3d] shadow-md ring-1 ring-[#c8e6d0] active:scale-95"
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

function Settings({
  session,
  onSave,
  onBack,
}: {
  session: Session;
  onSave: (s: Session) => void;
  onBack: () => void;
}) {
  const [recipientName, setRecipientName] = useState(session.recipientName);
  const [buttons, setButtons] = useState<ButtonDef[]>(session.buttons);

  const updateBtn = (i: number, patch: Partial<ButtonDef>) => {
    setButtons((bs) => bs.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  };

  return (
    <div className="flex flex-col gap-5 pt-4">
      <h2 className="text-4xl text-center text-[#d27ba3]" style={{ fontFamily: "Grand Hotel, cursive" }}>
        Personnaliser
      </h2>

      <label className="block">
        <span className="ml-2 mb-2 block text-sm font-medium text-[#8a7480]">Prénom affiché</span>
        <input
          type="text"
          maxLength={20}
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="w-full rounded-2xl border-2 border-[#f4b8d4]/40 bg-white/80 px-5 py-4 text-center text-2xl text-[#5a4a52] outline-none focus:border-[#f4b8d4]"
        />
      </label>

      <div className="flex flex-col gap-3">
        <p className="ml-2 text-sm font-medium text-[#8a7480]">Les 5 boutons</p>
        {buttons.map((b, i) => (
          <div key={b.key} className="flex gap-2 rounded-2xl bg-white/70 p-3 shadow-sm">
            <input
              type="text"
              maxLength={3}
              value={b.emoji}
              onChange={(e) => updateBtn(i, { emoji: e.target.value })}
              className="w-16 rounded-xl border border-[#f4b8d4]/30 bg-white px-2 py-3 text-center text-2xl outline-none"
            />
            <input
              type="text"
              maxLength={20}
              value={b.label}
              onChange={(e) => updateBtn(i, { label: e.target.value })}
              className="flex-1 rounded-xl border border-[#f4b8d4]/30 bg-white px-3 py-3 text-lg text-[#5a4a52] outline-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave({ ...session, recipientName: recipientName.trim(), buttons })}
        className="rounded-3xl bg-gradient-to-br from-[#c8e6d0] to-[#8fc9a3] px-6 py-5 text-xl font-semibold text-[#2d5a3d] shadow-lg active:scale-95"
      >
        Enregistrer
      </button>
      <button onClick={onBack} className="text-[#8a7480] underline">
        Annuler
      </button>
    </div>
  );
}
