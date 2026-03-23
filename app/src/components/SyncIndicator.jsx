import { useState, useEffect } from "react";

/**
 * Muestra un punto pulsante por 1.5s cada vez que syncing cambia a true.
 * No interrumpe el contenido — solo un indicador visual sutil en el header.
 */
export function SyncIndicator({ syncing }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!syncing) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [syncing]);

  if (!visible) return null;

  return (
    <div style={s.wrapper} title="Sincronizando...">
      <span style={s.dot} />
    </div>
  );
}

const s = {
  wrapper: {
    display: "flex", alignItems: "center",
    padding: "0 4px",
  },
  dot: {
    display: "inline-block",
    width: 6, height: 6,
    borderRadius: "50%",
    background: "var(--green)",
    animation: "syncPulse 1s ease-in-out infinite",
  },
};