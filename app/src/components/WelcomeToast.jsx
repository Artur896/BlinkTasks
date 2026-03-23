import { useEffect, useState } from "react";

export function WelcomeToast({ username, onDone }) {
  const [phase, setPhase] = useState("in"); // in | out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 2000);
    const t2 = setTimeout(() => onDone?.(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ ...s.toast, animation: phase === "in" ? "toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" : "toastOut 0.35s ease forwards" }}>
      <div style={s.avatar}>{username.slice(0, 2).toUpperCase()}</div>
      <div>
        <p style={s.greeting}>👋 Welcome back</p>
        <p style={s.name}>{username}</p>
      </div>
    </div>
  );
}

const s = {
  toast: {
    position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 20px", borderRadius: 14,
    background: "var(--surface)",
    border: "1px solid var(--border2)",
    boxShadow: "var(--shadow)",
    zIndex: 999,
    fontFamily: "'DM Mono', monospace",
    whiteSpace: "nowrap",
  },
  avatar: {
    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
    background: "linear-gradient(135deg, var(--accent), var(--green))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff",
  },
  greeting: { fontSize: 11, color: "var(--muted)", marginBottom: 2 },
  name:     { fontSize: 14, fontWeight: 600, color: "var(--text)" },
};