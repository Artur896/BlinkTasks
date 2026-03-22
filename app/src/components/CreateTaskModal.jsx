import { useState } from "react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

const CATEGORIES = ["Diseño", "Código", "Redacción", "Marketing", "Video", "Audio", "3D", "Otro"];

export function CreateTaskModal({ onClose, onCreate, creating }) {
  const { isMobile } = useBreakpoint();
  const [form, setForm] = useState({ title: "", description: "", category: "", sol: "0.01", deadline: "" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim())       return setError("El título es requerido");
    if (!form.description.trim()) return setError("La descripción es requerida");
    if (!form.category)           return setError("Elige una categoría");
    const amount = parseFloat(form.sol);
    if (isNaN(amount) || amount <= 0) return setError("Monto inválido");
    if (form.title.length > 100)       return setError("Título máx 100 chars");
    if (form.description.length > 500) return setError("Descripción máx 500 chars");
    const deadlineTs = form.deadline ? Math.floor(new Date(form.deadline).getTime() / 1000) : 0;
    try {
      await onCreate({ amount: Math.round(amount * 1e9), title: form.title, description: form.description, category: form.category, deadline: deadlineTs });
      onClose();
    } catch (e) {
      setError(e.message || "Error al crear tarea");
    }
  };

  return (
    <div style={s.overlay} className="modal-overlay" onClick={onClose}>
      <div style={s.modal(isMobile)} className="modal-sheet" onClick={e => e.stopPropagation()}>

        {isMobile && <div style={s.handle} />}

        <div style={s.header}>
          <span style={s.title}>Nueva tarea</span>
          {!isMobile && <button onClick={onClose} style={s.closeBtn}>✕</button>}
        </div>

        <div style={s.body}>
          <Field label="Título *" hint={`${form.title.length}/100`}>
            <input style={s.input} value={form.title} maxLength={100}
              onChange={e => set("title", e.target.value)}
              placeholder="Ej: Diseñar logo para startup" />
          </Field>

          <Field label="Descripción *" hint={`${form.description.length}/500`}>
            <textarea style={{ ...s.input, height: 90, resize: "vertical" }}
              value={form.description} maxLength={500}
              onChange={e => set("description", e.target.value)}
              placeholder="Explica qué necesitas: entregables, formato, referencias..." />
          </Field>

          <Field label="Categoría *">
            <div style={s.chipRow}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => set("category", cat)}
                  style={form.category === cat ? s.chipActive : s.chip}>
                  {cat}
                </button>
              ))}
            </div>
          </Field>

          {/* Pago + Deadline — apilados en mobile, lado a lado en desktop */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <Field label="Pago en SOL *">
              <div style={s.inputRow}>
                <input type="number" min="0.000001" step="0.001"
                  style={{ ...s.input, flex: 1, borderRadius: "8px 0 0 8px", borderRight: "none" }}
                  value={form.sol}
                  onChange={e => set("sol", e.target.value)} />
                <span style={s.unit}>SOL</span>
              </div>
              <span style={{ fontSize: 10, color: "#3a3a55", marginTop: 4 }}>
                ≈ {Math.round(parseFloat(form.sol || 0) * 1e9).toLocaleString()} lamps
              </span>
            </Field>

            <Field label="Deadline (opcional)">
              <input type="date" style={s.input}
                value={form.deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => set("deadline", e.target.value)} />
            </Field>
          </div>

          {error && <p style={s.error}>{error}</p>}
        </div>

        <div style={s.footer}>
          {!isMobile && <button onClick={onClose} style={s.cancelBtn}>Cancelar</button>}
          <button onClick={handleSubmit} disabled={creating}
            style={{ ...s.confirmBtn, flex: isMobile ? "1" : "2" }}>
            {creating ? "Creando..." : "Crear y bloquear SOL"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
        {hint && <span style={{ fontSize: 10, color: "#3a3a55" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const s = {
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  modal:      (isMobile) => ({ background: "#13131a", border: "1px solid #2a2a3d", borderRadius: isMobile ? "20px 20px 0 0" : 16, width: "100%", maxWidth: isMobile ? "100%" : 520, maxHeight: isMobile ? "92vh" : "90vh", overflowY: "auto", fontFamily: "'DM Mono', monospace" }),
  handle:     { width: 40, height: 4, borderRadius: 2, background: "#2a2a3d", margin: "12px auto 0" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #2a2a3d", position: "sticky", top: 0, background: "#13131a" },
  title:      { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#f0f0fa" },
  closeBtn:   { background: "none", color: "#6b6b8a", fontSize: 16, padding: "4px 8px", borderRadius: 6 },
  body:       { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 },
  input:      { width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3d", borderRadius: 8, padding: "10px 12px", color: "#f0f0fa", fontSize: 14, fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box" },
  inputRow:   { display: "flex", alignItems: "stretch", background: "#0a0a0f", border: "1px solid #2a2a3d", borderRadius: 8 },
  unit:       { padding: "0 12px", display: "flex", alignItems: "center", color: "#6b6b8a", fontSize: 12, background: "#1c1c27", borderRadius: "0 8px 8px 0", borderLeft: "1px solid #2a2a3d" },
  chipRow:    { display: "flex", flexWrap: "wrap", gap: 6 },
  chip:       { padding: "6px 14px", borderRadius: 999, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, cursor: "pointer", minHeight: 36 },
  chipActive: { padding: "6px 14px", borderRadius: 999, background: "#7c6dff22", color: "#a78bfa", border: "1px solid #7c6dff55", fontSize: 12, cursor: "pointer", minHeight: 36 },
  error:      { color: "#ff5f6d", fontSize: 12 },
  footer:     { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid #2a2a3d", position: "sticky", bottom: 0, background: "#13131a" },
  cancelBtn:  { flex: 1, padding: "10px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13 },
  confirmBtn: { padding: "12px 10px", borderRadius: 10, background: "linear-gradient(135deg, #7c6dff, #a78bfa)", color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "'Syne', sans-serif" },
};