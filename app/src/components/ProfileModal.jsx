import { useState } from "react";

const SKILLS_OPTIONS = ["Diseño", "Código", "Redacción", "Marketing", "Video", "Audio", "3D", "Otro"];

export function ProfileModal({ existing, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    username: existing?.username || "",
    bio:      existing?.bio      || "",
    skills:   existing?.skills   || "",
    contact:  existing?.contact  || "",
  });
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.username.trim()) return setError("El username es requerido");
    if (form.username.length > 50)  return setError("Username máx 50 chars");
    if (form.bio.length > 200)      return setError("Bio máx 200 chars");
    if (form.skills.length > 100)   return setError("Skills máx 100 chars");
    if (form.contact.length > 100)  return setError("Contacto máx 100 chars");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message || "Error al guardar");
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <span style={s.title}>{existing ? "Editar perfil" : "Crear perfil"}</span>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.body}>
          <Field label="Username *" hint="máx 50 chars">
            <input style={s.input} value={form.username} maxLength={50}
              onChange={e => set("username", e.target.value)} placeholder="satoshi_dev" />
          </Field>

          <Field label="Bio" hint={`${form.bio.length}/200`}>
            <textarea style={{ ...s.input, height: 80, resize: "vertical" }}
              value={form.bio} maxLength={200}
              onChange={e => set("bio", e.target.value)}
              placeholder="Cuéntale a los clientes quién eres..." />
          </Field>

          <Field label="Skills" hint="máx 100 chars — separadas por comas">
            <div style={s.chipRow}>
              {SKILLS_OPTIONS.map(skill => {
                const active = form.skills.toLowerCase().includes(skill.toLowerCase());
                return (
                  <button key={skill} onClick={() => {
                    const arr = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
                    const idx = arr.findIndex(s => s.toLowerCase() === skill.toLowerCase());
                    if (idx >= 0) arr.splice(idx, 1); else arr.push(skill);
                    set("skills", arr.join(", "));
                  }} style={active ? s.chipActive : s.chip}>
                    {skill}
                  </button>
                );
              })}
            </div>
            <input style={{ ...s.input, marginTop: 8 }} value={form.skills} maxLength={100}
              onChange={e => set("skills", e.target.value)}
              placeholder="o escribe tus skills manualmente" />
          </Field>

          <Field label="Contacto" hint="email, Telegram, Discord, etc.">
            <input style={s.input} value={form.contact} maxLength={100}
              onChange={e => set("contact", e.target.value)}
              placeholder="@tu_usuario / tu@email.com" />
          </Field>

          {error && <p style={s.error}>{error}</p>}
        </div>

        <div style={s.footer}>
          <button onClick={onClose} style={s.cancelBtn}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={s.confirmBtn}>
            {loading ? "Guardando..." : existing ? "Actualizar perfil" : "Crear perfil + vault"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
        {hint && <span style={{ fontSize: 10, color: "#3a3a55" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  modal:   { background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", fontFamily: "'DM Mono', monospace" },
  header:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #2a2a3d", position: "sticky", top: 0, background: "#13131a", zIndex: 1 },
  title:   { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#f0f0fa" },
  closeBtn:{ background: "none", color: "#6b6b8a", fontSize: 16, padding: "4px 8px", borderRadius: 6 },
  body:    { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 },
  input:   { width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3d", borderRadius: 8, padding: "10px 12px", color: "#f0f0fa", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip:    { padding: "4px 12px", borderRadius: 999, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, cursor: "pointer" },
  chipActive: { padding: "4px 12px", borderRadius: 999, background: "#7c6dff22", color: "#a78bfa", border: "1px solid #7c6dff55", fontSize: 12, cursor: "pointer" },
  error:   { color: "#ff5f6d", fontSize: 12 },
  footer:  { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid #2a2a3d", position: "sticky", bottom: 0, background: "#13131a" },
  cancelBtn:  { flex: 1, padding: "10px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13 },
  confirmBtn: { flex: 2, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg, #7c6dff, #a78bfa)", color: "#fff", fontWeight: 600, fontSize: 13, fontFamily: "'Syne', sans-serif" },
};