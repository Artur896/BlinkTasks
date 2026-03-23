import { useState, useEffect } from "react";

/**
 * Modal de confirmación llamativo con animación.
 * Props:
 *   type:    "success" | "error" | "warning" | "info"
 *   title:   string
 *   message: string
 *   onClose: función
 *   autoClose: ms (default 3500, 0 = no auto-close)
 */
export function SuccessModal({ type = "success", title, message, onClose, autoClose = 3500 }) {
  const [phase, setPhase] = useState("in"); // "in" | "out"

  const config = {
    success: { color: "#22d3a5", bg: "rgba(34,211,165,0.08)", border: "rgba(34,211,165,0.25)", icon: <CheckIcon /> },
    error:   { color: "#ff5f6d", bg: "rgba(255,95,109,0.08)", border: "rgba(255,95,109,0.25)", icon: <XIcon /> },
    warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: <WarnIcon /> },
    info:    { color: "#7c6dff", bg: "rgba(124,109,255,0.08)", border: "rgba(124,109,255,0.25)", icon: <InfoIcon /> },
  }[type];

  const handleClose = () => {
    setPhase("out");
    setTimeout(onClose, 320);
  };

  useEffect(() => {
    if (autoClose > 0) {
      const t = setTimeout(handleClose, autoClose);
      return () => clearTimeout(t);
    }
  }, []);

  // Cierra con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 500,
        animation: phase === "in"
          ? "overlayIn 0.2s ease forwards"
          : "overlayOut 0.3s ease forwards",
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#13131a",
          border: `1px solid ${config.border}`,
          borderRadius: 24,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${config.border}`,
          animation: phase === "in"
            ? "successIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards"
            : "successOut 0.3s cubic-bezier(0.4,0,1,1) forwards",
        }}>

        {/* Ícono con anillo animado */}
        <div style={{ position: "relative", width: 80, height: 80 }}>
          {/* Anillo exterior pulsante */}
          <div style={{
            position: "absolute", inset: -8,
            borderRadius: "50%",
            border: `2px solid ${config.color}`,
            opacity: 0.2,
            animation: "ringPulse 1.8s ease-in-out infinite",
          }} />
          {/* Anillo medio */}
          <div style={{
            position: "absolute", inset: -3,
            borderRadius: "50%",
            border: `1.5px solid ${config.color}`,
            opacity: 0.35,
            animation: "ringPulse 1.8s ease-in-out infinite 0.3s",
          }} />
          {/* Círculo principal */}
          <div style={{
            width: 80, height: 80,
            borderRadius: "50%",
            background: config.bg,
            border: `2px solid ${config.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "iconBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke={config.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {config.icon}
            </svg>
          </div>
        </div>

        {/* Texto */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeSlideUp 0.4s ease 0.2s both" }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800, fontSize: 22,
            color: "#f0f0fa", margin: 0,
            letterSpacing: "-0.02em",
          }}>
            {title}
          </h2>
          {message && (
            <p style={{
              fontSize: 14, color: "#6b6b8a",
              fontFamily: "'DM Mono', monospace",
              lineHeight: 1.6, margin: 0,
            }}>
              {message}
            </p>
          )}
        </div>

        {/* Barra de progreso de auto-close */}
        {autoClose > 0 && (
          <div style={{
            width: "100%", height: 3,
            background: "#1c1c27",
            borderRadius: 99,
            overflow: "hidden",
            marginTop: 8,
          }}>
            <div style={{
              height: "100%",
              background: `linear-gradient(90deg, ${config.color}, ${config.color}99)`,
              borderRadius: 99,
              animation: `progressDrain ${autoClose}ms linear forwards`,
            }} />
          </div>
        )}

        <button onClick={handleClose} style={{
          padding: "10px 28px",
          borderRadius: 10,
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
          fontSize: 13, fontWeight: 600,
          fontFamily: "'Syne', sans-serif",
          cursor: "pointer",
          marginTop: 4,
          animation: "fadeSlideUp 0.4s ease 0.3s both",
        }}>
          OK
        </button>
      </div>

      <style>{`
        @keyframes overlayOut    { to { opacity: 0; } }
        @keyframes successIn     { from { opacity:0; transform:scale(0.85) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes successOut    { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.9) translateY(-10px); } }
        @keyframes iconBounce    { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes ringPulse     { 0%,100% { transform:scale(1); opacity:0.2; } 50% { transform:scale(1.15); opacity:0; } }
        @keyframes fadeSlideUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes progressDrain { from { width:100%; } to { width:0%; } }
      `}</style>
    </div>
  );
}

function CheckIcon() { return <><polyline points="20 6 9 17 4 12"/></>; }
function XIcon()     { return <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>; }
function WarnIcon()  { return <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>; }
function InfoIcon()  { return <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>; }