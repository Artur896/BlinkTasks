import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage.jsx";
import { Modal, ModalBtn, Field, inputStyle } from "./Modal.jsx";

const SKILLS_OPTIONS = ["Diseño", "Código", "Redacción", "Marketing", "Video", "Audio", "3D", "Otro"];

const CONTACT_FIELDS = [
  {
    key: "whatsapp",
    icon: "📱",
    label: "WhatsApp",
    placeholder: "+52 55 1234 5678",
    prefix: "https://wa.me/",
    color: "#25D366",
  },
  {
    key: "discord",
    icon: "🎮",
    label: "Discord",
    placeholder: "usuario#0000",
    prefix: null,
    color: "#5865F2",
  },
  {
    key: "telegram",
    icon: "✈️",
    label: "Telegram",
    placeholder: "@usuario",
    prefix: "https://t.me/",
    color: "#26A5E4",
  },
  {
    key: "github",
    icon: "💻",
    label: "GitHub",
    placeholder: "tu-usuario",
    prefix: "https://github.com/",
    color: "#f0f0fa",
  },
];

export function ProfileModal({ existing, onClose, onSave, loading }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    username: existing?.username || "",
    bio:      existing?.bio      || "",
    skills:   existing?.skills   || "",
    whatsapp: existing?.whatsapp || "",
    discord:  existing?.discord  || "",
    telegram: existing?.telegram || "",
    github:   existing?.github   || "",
  });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.username.trim()) return setError(t("usernameRequired"));
    if (form.username.length > 50)  return setError(t("usernameMax"));
    if (form.bio.length > 200)      return setError(t("bioMax"));
    if (form.skills.length > 100)   return setError(t("skillsMax"));
    for (const f of CONTACT_FIELDS) {
      if (form[f.key].length > 50) return setError(`${f.label} máx 50 chars`);
    }
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message || t("errorSaving"));
    }
  };

  const toggleSkill = (skill) => {
    const arr = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
    const idx = arr.findIndex(s => s.toLowerCase() === skill.toLowerCase());
    if (idx >= 0) arr.splice(idx, 1); else arr.push(skill);
    set("skills", arr.join(", "));
  };

  return (
    <Modal
      onClose={onClose}
      title={existing ? t("updateProfile") : t("createProfileVault")}
      accentColor="var(--accent)"
      maxWidth={500}
      footer={
        <>
          <ModalBtn variant="secondary" onClick={onClose} fullWidth>{t("cancel")}</ModalBtn>
          <ModalBtn variant="primary" onClick={handleSubmit} disabled={loading} fullWidth>
            {loading ? t("saving") : existing ? t("updateProfile") : t("createProfileVault")}
          </ModalBtn>
        </>
      }
    >
      {/* Username */}
      <Field label={t("usernameLabel")} hint="máx 50">
        <input style={inputStyle} value={form.username} maxLength={50}
          onChange={e => set("username", e.target.value)}
          placeholder="satoshi_dev" autoComplete="off" autoCapitalize="none" />
      </Field>

      {/* Bio */}
      <Field label={t("bioLabel")} hint={`${form.bio.length}/200`}>
        <textarea style={{ ...inputStyle, height: 72, resize: "vertical" }}
          value={form.bio} maxLength={200}
          onChange={e => set("bio", e.target.value)}
          placeholder={t("bioPlaceholder")} />
      </Field>

      {/* Skills */}
      <Field label={t("skillsLabel")} hint="máx 100">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {SKILLS_OPTIONS.map(skill => {
            const active = form.skills.toLowerCase().includes(skill.toLowerCase());
            return (
              <button key={skill} onClick={() => toggleSkill(skill)}
                style={active ? s.chipActive : s.chip}>
                {skill}
              </button>
            );
          })}
        </div>
        <input style={inputStyle} value={form.skills} maxLength={100}
          onChange={e => set("skills", e.target.value)}
          placeholder={t("skillsPlaceholder")} />
      </Field>

      {/* Contacto estructurado */}
      <div style={s.contactSection}>
        <span style={s.sectionLabel}>
          {t("contact")} — {t("atLeastOne") || "al menos uno para recibir trabajo"}
        </span>
        <div style={s.contactGrid}>
          {CONTACT_FIELDS.map(field => (
            <div key={field.key} style={s.contactField}>
              <div style={s.contactLabel(field.color)}>
                <span style={{ fontSize: 14 }}>{field.icon}</span>
                <span style={{ color: field.color, fontSize: 11, fontWeight: 600 }}>{field.label}</span>
              </div>
              <div style={s.contactInputRow}>
                {field.prefix && (
                  <span style={s.prefix}>{field.prefix}</span>
                )}
                <input
                  style={{
                    ...inputStyle,
                    borderRadius: field.prefix ? "0 8px 8px 0" : 8,
                    borderLeft: field.prefix ? "none" : `1px solid var(--border)`,
                    flex: 1,
                    fontSize: 13,
                    padding: "9px 10px",
                  }}
                  value={form[field.key]}
                  maxLength={50}
                  onChange={e => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  autoCapitalize="none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "var(--red)", fontSize: 12 }}>{error}</p>}
    </Modal>
  );
}

const s = {
  chip:       { padding: "5px 12px", borderRadius: 999, background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 12, cursor: "pointer", minHeight: 32 },
  chipActive: { padding: "5px 12px", borderRadius: 999, background: "rgba(124,109,255,0.15)", color: "var(--accent2)", border: "1px solid rgba(124,109,255,0.4)", fontSize: 12, cursor: "pointer", minHeight: 32 },
  contactSection: { display: "flex", flexDirection: "column", gap: 10 },
  sectionLabel:   { fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" },
  contactGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  contactField:   { display: "flex", flexDirection: "column", gap: 5 },
  contactLabel:   (color) => ({ display: "flex", alignItems: "center", gap: 5 }),
  contactInputRow:{ display: "flex", alignItems: "stretch" },
  prefix:         { display: "flex", alignItems: "center", padding: "0 8px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "8px 0 0 8px", fontSize: 10, color: "var(--subtle)", whiteSpace: "nowrap", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" },
};