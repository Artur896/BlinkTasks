import { useWallet } from "@solana/wallet-adapter-react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

export function ProfileBadge({ profile, loading, checking, onCreateClick, onEditClick }) {
  const { connected } = useWallet();
  const { isMobile }  = useBreakpoint();
  if (!connected) return null;

  if (checking) return (
    <div style={s.badge("#1c1c27", "#3a3a55")}>
      <Dot color="#3a3a55" /> Verificando...
    </div>
  );

  if (!profile) return (
    <button onClick={onCreateClick} disabled={loading} style={s.createBtn}>
      {loading ? "Creando..." : "+ Crear perfil"}
    </button>
  );

  const avgRating = Number(profile.ratingCount) > 0
    ? (Number(profile.totalRating) / Number(profile.ratingCount)).toFixed(1)
    : null;

  return (
    <div style={s.row(isMobile)}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <div style={s.badge("#1c1c27", "#7c6dff")}>
          <Dot color="#7c6dff" />
          <span style={{ color: "#f0f0fa", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? 120 : 200 }}>
            {profile.username}
          </span>
        </div>
        {!isMobile && profile.skills && (
          <span style={s.skills}>{profile.skills}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16, flexShrink: 0 }}>
        {avgRating && (
          <div style={s.ratingPill}>
            <span style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
            <span style={{ color: "#f0f0fa", fontSize: 13, fontWeight: 600 }}>{avgRating}</span>
            {!isMobile && <span style={{ color: "#3a3a55", fontSize: 11 }}>({profile.ratingCount.toString()})</span>}
          </div>
        )}
        {!isMobile && <Stat label="Reputación" value={`${profile.reputation} pts`} color="#22d3a5" />}
        {!isMobile && <Stat label="Completadas" value={profile.tasksCompleted.toString()} />}
        <button onClick={onEditClick} style={s.editBtn}>
          {isMobile ? "✎" : "Editar"}
        </button>
      </div>
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

const s = {
  row:       (isMobile) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: isMobile ? "10px 14px" : "10px 16px", borderRadius: 12, background: "#13131a", border: "1px solid #2a2a3d" }),
  badge:     (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: bg, color, fontSize: 13, fontFamily: "'DM Mono', monospace", border: `1px solid ${color}33`, minWidth: 0 }),
  skills:    { fontSize: 11, color: "#6b6b8a", fontFamily: "'DM Mono', monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  ratingPill:{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: "#f59e0b11", border: "1px solid #f59e0b33" },
  createBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "#7c6dff22", color: "#7c6dff", border: "1px solid #7c6dff66", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer", width: "100%", justifyContent: "center" },
  editBtn:   { padding: "6px 14px", borderRadius: 8, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono', monospace", minHeight: 36 },
};