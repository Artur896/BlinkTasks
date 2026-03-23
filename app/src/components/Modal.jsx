import { useEffect, useState } from "react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

/**
 * Modal base reutilizable.
 * Props:
 *   onClose      — función para cerrar
 *   title        — string título del header
 *   accentColor  — color del gradiente del header (default: var(--accent))
 *   children     — contenido del modal
 *   footer       — JSX del footer (botones)
 *   maxWidth      — ancho máximo en desktop (default: 480)
 */
export function Modal({ onClose, title, accentColor, children, footer, maxWidth = 480 }) {
  const { isMobile } = useBreakpoint();
  const [phase, setPhase] = useState("in");

  const handleClose = () => {
    setPhase("out");
    setTimeout(onClose, 280);
  };

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const overlayAnim = phase === "in" ? "overlayIn 0.2s ease forwards" : "overlayIn 0.25s ease reverse forwards";
  const modalAnim   = isMobile
    ? (phase === "in" ? "slideUp 0.32s cubic-bezier(0.32,0.72,0,1) forwards" : "slideDown 0.28s ease forwards")
    : (phase === "in" ? "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards" : "modalOut 0.22s ease forwards");

  const accent = accentColor || "var(--accent)";

  return (
    <div style={{ ...s.overlay, animation: overlayAnim }} onClick={handleClose}>
      <div
        style={{
          ...s.modal(isMobile, maxWidth),
          animation: modalAnim,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle mobile */}
        {isMobile && <div style={s.handle} />}

        {/* Header con gradiente */}
        <div style={s.header(accent)}>
          <div style={s.headerInner}>
            <div style={s.accentDot(accent)} />
            <h2 style={s.title}>{title}</h2>
          </div>
          <button onClick={handleClose} style={s.closeBtn} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div style={s.body}>{children}</div>

        {/* Footer sticky */}
        {footer && <div style={s.footer}>{footer}</div>}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0,
    background: "var(--overlay)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },
  modal: (isMobile, maxWidth) => ({
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: isMobile ? "24px 24px 0 0" : 20,
    width: "100%",
    maxWidth: isMobile ? "100%" : maxWidth,
    maxHeight: isMobile ? "92vh" : "88vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--shadow)",
    ...(isMobile ? { position: "fixed", bottom: 0, left: 0, right: 0 } : {}),
  }),
  handle: {
    width: 40, height: 4, borderRadius: 2,
    background: "var(--border2)",
    margin: "14px auto 0",
    flexShrink: 0,
  },
  header: (accent) => ({
    padding: "18px 24px",
    borderBottom: "1px solid var(--border)",
    background: `linear-gradient(135deg, ${accent}18 0%, transparent 60%)`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexShrink: 0,
    position: "sticky", top: 0,
    backdropFilter: "blur(4px)",
    zIndex: 1,
  }),
  headerInner: { display: "flex", alignItems: "center", gap: 10 },
  accentDot: (accent) => ({
    width: 8, height: 8, borderRadius: "50%",
    background: accent,
    boxShadow: `0 0 8px ${accent}`,
    flexShrink: 0,
  }),
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700, fontSize: 17,
    color: "var(--text)", margin: 0,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    color: "var(--muted)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  body: {
    padding: "22px 24px",
    display: "flex", flexDirection: "column", gap: 18,
    overflowY: "auto", flex: 1,
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid var(--border)",
    display: "flex", gap: 10,
    position: "sticky", bottom: 0,
    background: "var(--surface)",
    flexShrink: 0,
  },
};

/* ── Botones estándar reutilizables ────────────────────────── */
export function ModalBtn({ onClick, disabled, variant = "primary", children, fullWidth }) {
  const base = {
    padding: "12px 20px",
    borderRadius: 12,
    fontSize: 14, fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
    border: "none",
    transition: "all 0.18s ease",
    flex: fullWidth ? 1 : "initial",
    minHeight: 48,
    letterSpacing: "0.02em",
  };
  const variants = {
    primary: {
      background: "linear-gradient(135deg, var(--accent), var(--accent2))",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(124,109,255,0.35)",
    },
    secondary: {
      background: "var(--surface2)",
      color: "var(--muted)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "linear-gradient(135deg, #ff5f6d22, #ff5f6d11)",
      color: "var(--red)",
      border: "1px solid #ff5f6d44",
    },
    success: {
      background: "linear-gradient(135deg, #22d3a522, #22d3a511)",
      color: "var(--green)",
      border: "1px solid #22d3a544",
    },
  };

  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

/* ── Campo de formulario reutilizable ──────────────────────── */
export function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {label}
        </span>
        {hint && <span style={{ fontSize: 10, color: "var(--subtle)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Input / Textarea estándar ─────────────────────────────── */
export const inputStyle = {
  width: "100%",
  background: "var(--input-bg)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "11px 14px",
  color: "var(--text)",
  fontSize: 14,
  fontFamily: "'DM Mono', monospace",
  outline: "none",
  transition: "border-color 0.18s",
  boxSizing: "border-box",
};