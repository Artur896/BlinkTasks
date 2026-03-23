import { useWallet } from "@solana/wallet-adapter-react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

export function ProfileBadge({ profile, loading, checking, onCreateClick, onEditClick }) {
  const { connected } = useWallet();
  const { isMobile }  = useBreakpoint();
  if (!connected) return null;

  if (checking) return (
    <div style={{ ...s.badge, color: "var(--subtle)" }}>
      <Dot /> Verificando...
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
    <div className="profile-badge" style={s.row(isMobile)}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <div style={s.badge}>
          <Dot />
          <span style={{ color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? 120 : 200 }}>
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
            <span style={{ color: "var(--amber)", fontSize: 14 }}>★</span>
            <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{avgRating}</span>
            {!isMobile && <span style={{ color: "var(--subtle)", fontSize: 11 }}>({profile.ratingCount.toString()})</span>}
          </div>
        )}
        {!isMobile && <Stat label="Reputación" value={`${profile.reputation} pts`} color="var(--green)" />}
        {!isMobile && <Stat label="Completadas" value={profile.tasksCompleted.toString()} />}
        <button onClick={onEditClick} style={s.editBtn}>
          {isMobile ? "✎" : "Editar"}
        </button>
      </div>
    </div>
  );
}

function Dot() {
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)", flexShrink: 0 }} />;
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span key={value} className="num-pop" style={{ fontSize: 14, fontWeight: 600, color: color || "var(--text)", fontFamily: "'Syne', sans-serif" }}>{value}</span>
    </div>
  );
}

const s = {
  row:       (isMobile) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: isMobile ? "10px 14px" : "12px 18px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", transition: "border-color 0.3s" }),
  badge:     { display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "var(--surface2)", fontSize: 13, fontFamily: "'DM Mono', monospace", border: "1px solid var(--accent)33", minWidth: 0 },
  skills:    { fontSize: 11, color: "var(--muted)", fontFamily: "'DM Mono', monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  ratingPill:{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" },
  createBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "var(--accent)22", color: "var(--accent)", border: "1px solid var(--accent)55", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer", width: "100%", justifyContent: "center", transition: "all 0.2s" },
  editBtn:   { padding: "6px 14px", borderRadius: 8, background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono', monospace", minHeight: 36, transition: "all 0.2s" },
};