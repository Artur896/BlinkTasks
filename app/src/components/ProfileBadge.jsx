import { useWallet } from "@solana/wallet-adapter-react";

export function ProfileBadge({ profile, loading, checking, onCreateClick, onEditClick }) {
  const { connected } = useWallet();
  if (!connected) return null;

  if (checking) {
    return <div style={s.badge("#1c1c27", "#3a3a55")}><Dot color="#3a3a55" /> Verificando...</div>;
  }

  if (!profile) {
    return (
      <button onClick={onCreateClick} disabled={loading} style={s.createBtn}>
        {loading ? <><Spinner /> Creando...</> : "+ Crear perfil"}
      </button>
    );
  }

  return (
    <div style={s.row}>
      <div style={s.badge("#1c1c27", "#7c6dff")}>
        <Dot color="#7c6dff" />
        <span style={{ color: "#f0f0fa", fontWeight: 600 }}>{profile.username}</span>
      </div>
      {profile.skills && (
        <span style={s.skills}>{profile.skills}</span>
      )}
      <Stat label="Reputación" value={`${profile.reputation} pts`} color="#22d3a5" />
      <Stat label="Completadas" value={profile.tasksCompleted.toString()} />
      <button onClick={onEditClick} style={s.editBtn}>Editar perfil</button>
    </div>
  );
}

function Dot({ color }) {
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />;
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: color || "#f0f0fa", fontFamily: "'Syne', sans-serif" }}>{value}</span>
    </div>
  );
}

function Spinner() {
  return <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #7c6dff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 6 }} />;
}

const s = {
  row:    { display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", borderRadius: 12, background: "#13131a", border: "1px solid #2a2a3d", flexWrap: "wrap" },
  badge:  (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: bg, color, fontSize: 13, fontFamily: "'DM Mono', monospace", border: `1px solid ${color}33` }),
  skills: { fontSize: 11, color: "#6b6b8a", fontFamily: "'DM Mono', monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  createBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999, background: "#7c6dff22", color: "#7c6dff", border: "1px solid #7c6dff66", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" },
  editBtn:   { padding: "5px 14px", borderRadius: 8, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace" },
};