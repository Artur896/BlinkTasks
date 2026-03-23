import { useState, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLanguage } from "../hooks/useLanguage.jsx";
import { Modal } from "./Modal.jsx";
import { getProgram } from "../anchor.js";
import { shortenAddress } from "../utils/helpers.js";

const CONTACT_LINKS = [
  { key: "whatsapp", icon: "📱", label: "WhatsApp", color: "#25D366", buildUrl: (v) => `https://wa.me/${v.replace(/\D/g, "")}` },
  { key: "discord",  icon: "🎮", label: "Discord",  color: "#5865F2", buildUrl: null },
  { key: "telegram", icon: "✈️", label: "Telegram", color: "#26A5E4", buildUrl: (v) => `https://t.me/${v.replace("@", "")}` },
  { key: "github",   icon: "💻", label: "GitHub",   color: "#f0f0fa", buildUrl: (v) => `https://github.com/${v}` },
];

export function PublicProfileModal({ pubkey, onClose }) {
  const wallet  = useWallet();
  const { t }   = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubkey || !wallet.publicKey) return;
    (async () => {
      setLoading(true);
      try {
        const program = getProgram(wallet);
        const pk      = new anchor.web3.PublicKey(pubkey);
        const [pda]   = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("profile"), pk.toBuffer()], program.programId
        );
        setProfile(await program.account.userProfile.fetch(pda));
      } catch { setProfile(null); }
      finally  { setLoading(false); }
    })();
  }, [pubkey]);

  const avgRating = profile && Number(profile.ratingCount) > 0
    ? (Number(profile.totalRating) / Number(profile.ratingCount)).toFixed(1)
    : null;

  const skillsList = profile?.skills
    ? profile.skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  // Contactos que tienen valor
  const contacts = profile
    ? CONTACT_LINKS.filter(c => profile[c.key] && profile[c.key].trim().length > 0)
    : [];

  return (
    <Modal onClose={onClose} title={profile?.username ?? "Profile"} accentColor="var(--green)" maxWidth={420}>
      {loading ? (
        <div style={s.center}><div style={s.spinner} /></div>
      ) : !profile ? (
        <div style={s.center}>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{t("noPublicProfile")}</p>
          <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 6 }}>{shortenAddress(pubkey, 8)}</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={s.header}>
            <div style={s.avatar}>{profile.username.slice(0, 2).toUpperCase()}</div>
            <div>
              <h2 style={s.username}>{profile.username}</h2>
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 3 }}>{shortenAddress(pubkey, 6)}</p>
            </div>
          </div>

          {/* Rating */}
          {avgRating && (
            <div style={s.ratingRow}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ fontSize: 18, color: "var(--amber)", opacity: n <= Math.round(Number(avgRating)) ? 1 : 0.2 }}>★</span>
              ))}
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginLeft: 8, fontFamily: "'Syne', sans-serif" }}>{avgRating}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>({profile.ratingCount.toString()} {t("reviews")})</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <Section label={t("aboutMe")}>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
            </Section>
          )}

          {/* Skills */}
          {skillsList.length > 0 && (
            <Section label={t("skills")}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skillsList.map(skill => (
                  <span key={skill} style={s.chip}>{skill}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Contacto estructurado */}
          {contacts.length > 0 && (
            <Section label={t("contact")}>
              <div style={s.contactGrid}>
                {contacts.map(c => {
                  const value = profile[c.key];
                  const url   = c.buildUrl ? c.buildUrl(value) : null;
                  return (
                    <div key={c.key} style={s.contactItem}>
                      <span style={{ fontSize: 16 }}>{c.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, color: c.color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{c.label}</p>
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, color: c.color, textDecoration: "none", fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                            {value}
                          </a>
                        ) : (
                          <p style={{ fontSize: 12, color: "var(--text)", fontFamily: "'DM Mono', monospace", margin: 0 }}>{value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Stats */}
          <div style={s.statsRow}>
            <StatBox label={t("tasksCompleted")} value={profile.tasksCompleted.toString()} color="var(--green)" />
            <StatBox label={t("tasksCreated")}   value={profile.tasksCreated.toString()} />
            <StatBox label={t("reputation")}     value={`${profile.reputation} ${t("pts")}`} color="var(--accent2)" />
          </div>
        </>
      )}
    </Modal>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      {children}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: color || "var(--text)" }}>{value}</span>
      <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>{label}</span>
    </div>
  );
}

const s = {
  center:      { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" },
  spinner:     { width: 28, height: 28, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  header:      { display: "flex", alignItems: "center", gap: 14 },
  avatar:      { width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, var(--accent), var(--green))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", flexShrink: 0 },
  username:    { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 19, color: "var(--text)", margin: 0 },
  ratingRow:   { display: "flex", alignItems: "center", gap: 3 },
  chip:        { padding: "4px 11px", borderRadius: 999, background: "rgba(124,109,255,0.12)", color: "var(--accent2)", border: "1px solid rgba(124,109,255,0.3)", fontSize: 12 },
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  contactItem: { display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", minWidth: 0 },
  statsRow:    { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, paddingTop: 16, borderTop: "1px solid var(--border)" },
};