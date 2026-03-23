import { useState, useEffect, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useLanguage } from "../hooks/useLanguage.jsx";

export function WalletMenu({ profile }) {
  const { publicKey, disconnect, connected } = useWallet();
  const { connection } = useConnection();
  const { lang } = useLanguage();

  const [open,        setOpen]        = useState(false);
  const [balance,     setBalance]     = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!publicKey || !connected || !open) return;
    connection.getBalance(publicKey).then(b => setBalance(b / LAMPORTS_PER_SOL));
  }, [publicKey, connected, open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowConfirm(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!connected || !publicKey) return null;

  const addr  = publicKey.toString();
  const short = addr.slice(0, 4) + "..." + addr.slice(-4);

  const copyAddress = () => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDisconnect = () => {
    disconnect();
    setOpen(false);
    setShowConfirm(false);
  };

  const avgRating = profile && Number(profile.ratingCount) > 0
    ? (Number(profile.totalRating) / Number(profile.ratingCount)).toFixed(1)
    : null;

  return (
    <div ref={ref} style={{ position: "relative" }}>

      <button
        onClick={() => { setOpen(v => !v); setShowConfirm(false); }}
        style={s.trigger}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        <span style={s.dot} />
        <span>{short}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div style={s.dropdown}>

          <div style={s.header}>
            <div style={s.avatar}>
              {profile?.username
                ? profile.username.slice(0, 2).toUpperCase()
                : addr.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {profile?.username && <p style={s.username}>{profile.username}</p>}
              <p style={s.addrSmall}>{short}</p>
            </div>
            <span style={s.networkBadge}>Localnet</span>
          </div>

          <div style={s.statsRow}>
            <StatItem label="Balance"
              value={balance !== null ? balance.toFixed(3) + " SOL" : "..."}
              color="var(--green)" />
            {profile && (
              <StatItem label={lang === "es" ? "Reputación" : "Reputation"}
                value={profile.reputation + " pts"}
                color="var(--accent2)" />
            )}
            {avgRating && (
              <StatItem label="Rating" value={"★ " + avgRating} color="var(--amber)" />
            )}
            {profile && (
              <StatItem
                label={lang === "es" ? "Tareas" : "Tasks"}
                value={profile.tasksCompleted.toString()} />
            )}
          </div>

          <div style={s.sep} />

          <div style={s.menuList}>
            <MenuBtn icon="copy" onClick={copyAddress}
              color={copied ? "var(--green)" : undefined}>
              {copied
                ? (lang === "es" ? "¡Copiado!" : "Copied!")
                : (lang === "es" ? "Copiar dirección" : "Copy address")}
            </MenuBtn>

            <MenuBtn icon="tasks" onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("blinktasks:filter", { detail: "submitted" }));
            }}>
              {lang === "es" ? "Revisar pagos pendientes" : "Review pending payments"}
            </MenuBtn>

            <div style={s.sep} />

            {!showConfirm ? (
              <MenuBtn icon="logout" color="var(--red)" onClick={() => setShowConfirm(true)}>
                {lang === "es" ? "Desconectar" : "Disconnect"}
              </MenuBtn>
            ) : (
              <div style={s.confirmBox}>
                <p style={s.confirmQ}>
                  {lang === "es"
                    ? "¿Seguro que quieres salir?"
                    : "Are you sure you want to disconnect?"}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleDisconnect} style={s.yesBtn}>
                    {lang === "es" ? "Sí, salir" : "Yes, leave"}
                  </button>
                  <button onClick={() => setShowConfirm(false)} style={s.noBtn}>
                    {lang === "es" ? "Cancelar" : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || "var(--text)", fontFamily: "'Syne', sans-serif" }}>
        {value}
      </span>
      <span style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
    </div>
  );
}

function MenuBtn({ icon, color, onClick, children }) {
  const [hover, setHover] = useState(false);
  const icons = {
    copy:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
    tasks:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 8, border: "none",
        background: hover ? "rgba(255,255,255,0.05)" : "transparent",
        color: color || "var(--text)",
        fontSize: 13, fontFamily: "'DM Mono', monospace",
        cursor: "pointer", textAlign: "left",
        transform: hover ? "translateX(3px)" : "translateX(0)",
        transition: "all 0.14s ease",
      }}>
      <span style={{ opacity: 0.65, display: "flex" }}>{icons[icon]}</span>
      {children}
    </button>
  );
}

const s = {
  trigger: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px", borderRadius: 10,
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    color: "#fff", fontSize: 13, fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    border: "none", cursor: "pointer",
    boxShadow: "0 4px 14px rgba(124,109,255,0.4)",
    transition: "opacity 0.18s ease",
  },
  dot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "var(--green)", boxShadow: "0 0 6px var(--green)",
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute", right: 0, top: "calc(100% + 10px)",
    width: 276,
    background: "rgba(10,10,18,0.94)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(124,109,255,0.22)",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
    overflow: "hidden", zIndex: 200,
    animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards",
  },
  header: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 14px 12px",
    background: "linear-gradient(135deg, rgba(124,109,255,0.14) 0%, transparent 70%)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  avatar: {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    background: "linear-gradient(135deg, var(--accent), var(--green))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff",
  },
  username:     { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#f0f0fa", marginBottom: 2 },
  addrSmall:    { fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" },
  networkBadge: { fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "rgba(34,211,165,0.12)", color: "var(--green)", border: "1px solid rgba(34,211,165,0.25)", fontFamily: "'DM Mono', monospace", flexShrink: 0 },
  statsRow:     { display: "flex", padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 4 },
  sep:          { height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" },
  menuList:     { padding: "6px 6px 10px" },
  confirmBox:   { padding: "8px 12px 4px", display: "flex", flexDirection: "column", gap: 10 },
  confirmQ:     { fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Mono', monospace", lineHeight: 1.5 },
  yesBtn:       { flex: 1, padding: "8px", borderRadius: 8, background: "rgba(255,95,109,0.15)", color: "var(--red)", border: "1px solid rgba(255,95,109,0.3)", fontSize: 12, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600 },
  noBtn:        { flex: 1, padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace" },
};