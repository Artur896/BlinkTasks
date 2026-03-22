import { useState, useRef, useEffect } from "react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

export function NotificationBell({ notifications, unread, onMarkRead }) {
  const [open, setOpen] = useState(false);
  const { isMobile }    = useBreakpoint();
  const ref             = useRef(null);

  const toggle = () => {
    setOpen(v => !v);
    if (!open && unread > 0) onMarkRead();
  };

  // Cierra al click fuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={toggle} style={s.bell}>
        <BellIcon />
        {unread > 0 && <span style={s.badge}>{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        isMobile ? (
          /* Mobile: panel fijo en bottom */
          <>
            <div style={s.mobileOverlay} onClick={() => setOpen(false)} />
            <div style={s.mobilePanel}>
              <div style={s.handle} />
              <div style={s.dropHeader}>
                <span style={s.dropTitle}>Notificaciones</span>
                <button onClick={() => setOpen(false)} style={{ background: "none", color: "#6b6b8a", fontSize: 16, cursor: "pointer" }}>✕</button>
              </div>
              <NotifList notifications={notifications} />
            </div>
          </>
        ) : (
          /* Desktop: dropdown */
          <div style={s.dropdown}>
            <div style={s.dropHeader}>
              <span style={s.dropTitle}>Notificaciones</span>
            </div>
            <NotifList notifications={notifications} />
          </div>
        )
      )}
    </div>
  );
}

function NotifList({ notifications }) {
  if (notifications.length === 0) {
    return <p style={{ padding: "20px 16px", color: "#3a3a55", fontSize: 13, textAlign: "center" }}>Sin notificaciones</p>;
  }
  return notifications.map(n => (
    <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #1c1c27", background: n.read ? "transparent" : "#7c6dff0a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#c0c0d0", lineHeight: 1.4 }}>{n.msg}</span>
        {n.taskId && <span style={{ fontSize: 11, color: "#7c6dff", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>#{n.taskId}</span>}
      </div>
      <span style={{ fontSize: 10, color: "#3a3a55", fontFamily: "'DM Mono', monospace" }}>
        {n.ts.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  ));
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

const s = {
  bell:          { position: "relative", background: "#1c1c27", border: "1px solid #2a2a3d", borderRadius: 10, padding: "8px 10px", color: "#6b6b8a", cursor: "pointer", display: "flex", alignItems: "center", minHeight: 40, minWidth: 40, justifyContent: "center" },
  badge:         { position: "absolute", top: -6, right: -6, background: "#7c6dff", color: "#fff", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  dropdown:      { position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 12, overflow: "hidden", zIndex: 200, maxHeight: 360, overflowY: "auto" },
  dropHeader:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2a2a3d", position: "sticky", top: 0, background: "#13131a" },
  dropTitle:     { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#f0f0fa" },
  mobileOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300 },
  mobilePanel:   { position: "fixed", bottom: 0, left: 0, right: 0, background: "#13131a", border: "1px solid #2a2a3d", borderRadius: "20px 20px 0 0", zIndex: 301, maxHeight: "70vh", overflowY: "auto", animation: "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)" },
  handle:        { width: 40, height: 4, borderRadius: 2, background: "#2a2a3d", margin: "12px auto 0" },
};