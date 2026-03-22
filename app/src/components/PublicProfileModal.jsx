import { useState, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { getProgram } from "../anchor.js";
import { shortenAddress } from "../utils/helpers.js";

export function PublicProfileModal({ pubkey, onClose }) {
  const wallet = useWallet();
  const { isMobile } = useBreakpoint();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubkey || !wallet.publicKey) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const program = getProgram(wallet);
        const pk      = new anchor.web3.PublicKey(pubkey);
        const [pda]   = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("profile"), pk.toBuffer()], program.programId
        );
        const data = await program.account.userProfile.fetch(pda);
        setProfile(data);
      } catch { setProfile(null); }
      finally { setLoading(false); }
    };
    fetch();
  }, [pubkey]);

  const avgRating = profile && Number(profile.ratingCount) > 0
    ? (Number(profile.totalRating) / Number(profile.ratingCount)).toFixed(1)
    : null;

  const skillsList = profile?.skills
    ? profile.skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={s.overlay} className="modal-overlay" onClick={onClose}>
      <div style={s.modal(isMobile)} className="modal-sheet" onClick={e => e.stopPropagation()}>

        {isMobile && <div style={s.handle} />}
        <button onClick={onClose} style={s.closeBtn}>✕</button>

        {loading ? (
          <div style={s.center}><div style={s.spinner} /></div>
        ) : !profile ? (
          <div style={s.center}>
            <p style={{ color: "#6b6b8a", fontSize: 14 }}>Sin perfil público</p>
            <p style={{ fontSize: 11, color: "#3a3a55", marginTop: 6 }}>{shortenAddress(pubkey, 8)}</p>
          </div>
        ) : (
          <>
            <div style={s.profileHeader}>
              <div style={s.avatar}>{profile.username.slice(0, 2).toUpperCase()}</div>
              <div>
                <h2 style={s.username}>{profile.username}</h2>
                <p style={{ fontSize: 11, color: "#3a3a55", marginTop: 4 }}>{shortenAddress(pubkey, 6)}</p>
              </div>
            </div>

            {avgRating && (
              <div style={s.ratingRow}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ fontSize: 20, opacity: n <= Math.round(Number(avgRating)) ? 1 : 0.2, color: "#f59e0b" }}>★</span>
                ))}
                <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0fa", marginLeft: 8, fontFamily: "'Syne', sans-serif" }}>{avgRating}</span>
                <span style={{ fontSize: 12, color: "#6b6b8a" }}>({profile.ratingCount.toString()} reseñas)</span>
              </div>
            )}

            {profile.bio && (
              <div style={s.section}>
                <span style={s.sectionLabel}>Sobre mí</span>
                <p style={{ fontSize: 13, color: "#c0c0d0", lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
              </div>
            )}

            {skillsList.length > 0 && (
              <div style={s.section}>
                <span style={s.sectionLabel}>Skills</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skillsList.map(skill => (
                    <span key={skill} style={{ padding: "5px 12px", borderRadius: 999, background: "#7c6dff15", color: "#a78bfa", border: "1px solid #7c6dff33", fontSize: 12 }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.contact && (
              <div style={s.section}>
                <span style={s.sectionLabel}>Contacto</span>
                <p style={{ fontSize: 13, color: "#7c6dff", margin: 0 }}>{profile.contact}</p>
              </div>
            )}

            <div style={s.statsRow}>
              <StatBox label="Completadas" value={profile.tasksCompleted.toString()} color="#22d3a5" />
              <StatBox label="Creadas"     value={profile.tasksCreated.toString()} />
              <StatBox label="Reputación"  value={`${profile.reputation} pts`} color="#a78bfa" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", background: "#1c1c27", borderRadius: 10, border: "1px solid #2a2a3d" }}>
      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: color || "#f0f0fa" }}>{value}</span>
      <span style={{ fontSize: 10, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>{label}</span>
    </div>
  );
}

const s = {
  overlay:       { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(6px)" },
  modal:         (isMobile) => ({ background: "#13131a", border: "1px solid #2a2a3d", borderRadius: isMobile ? "20px 20px 0 0" : 20, width: "100%", maxWidth: isMobile ? "100%" : 420, maxHeight: isMobile ? "88vh" : "90vh", overflowY: "auto", padding: "28px 24px 32px", position: "relative", fontFamily: "'DM Mono', monospace" }),
  handle:        { width: 40, height: 4, borderRadius: 2, background: "#2a2a3d", margin: "-16px auto 16px" },
  closeBtn:      { position: "absolute", top: 16, right: 16, background: "none", color: "#6b6b8a", fontSize: 16, padding: "4px 8px", borderRadius: 6, cursor: "pointer" },
  center:        { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" },
  spinner:       { width: 28, height: 28, border: "2px solid #2a2a3d", borderTopColor: "#7c6dff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  profileHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 20 },
  avatar:        { width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #7c6dff, #22d3a5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", flexShrink: 0 },
  username:      { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "#f0f0fa", margin: 0 },
  ratingRow:     { display: "flex", alignItems: "center", gap: 3, marginBottom: 20 },
  section:       { marginBottom: 18, display: "flex", flexDirection: "column", gap: 8 },
  sectionLabel:  { fontSize: 10, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.1em" },
  statsRow:      { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 8, paddingTop: 18, borderTop: "1px solid #2a2a3d" },
};