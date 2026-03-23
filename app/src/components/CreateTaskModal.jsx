import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage.jsx";
import { Modal, ModalBtn, Field, inputStyle } from "./Modal.jsx";

export function CreateTaskModal({ onClose, onCreate, creating }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ title: "", description: "", category: "", sol: "0.01", deadline: "" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const categories = t("categories");

  const handleSubmit = async () => {
    if (!form.title.trim())       return setError(t("titleRequired"));
    if (!form.description.trim()) return setError(t("descriptionRequired"));
    if (!form.category)           return setError(t("categoryRequired"));
    const amount = parseFloat(form.sol);
    if (isNaN(amount) || amount <= 0) return setError(t("invalidAmount"));
    if (form.title.length > 100)       return setError(t("titleMax"));
    if (form.description.length > 500) return setError(t("descriptionMax"));
    const deadlineTs = form.deadline ? Math.floor(new Date(form.deadline).getTime() / 1000) : 0;
    try {
      await onCreate({ amount: Math.round(amount * 1e9), title: form.title, description: form.description, category: form.category, deadline: deadlineTs });
      onClose();
    } catch (e) {
      setError(e.message || t("errorCreating"));
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t("newTask")}
      accentColor="var(--accent2)"
      maxWidth={540}
      footer={
        <>
          <ModalBtn variant="secondary" onClick={onClose} fullWidth>{t("cancel")}</ModalBtn>
          <ModalBtn variant="primary" onClick={handleSubmit} disabled={creating} fullWidth>
            {creating ? t("creating") : t("createAndLock")}
          </ModalBtn>
        </>
      }
    >
      <Field label={t("taskTitle")} hint={`${form.title.length}/100`}>
        <input style={inputStyle} value={form.title} maxLength={100}
          onChange={e => set("title", e.target.value)}
          placeholder={t("taskTitlePlaceholder")} />
      </Field>

      <Field label={t("taskDescription")} hint={`${form.description.length}/500`}>
        <textarea style={{ ...inputStyle, height: 90, resize: "vertical" }}
          value={form.description} maxLength={500}
          onChange={e => set("description", e.target.value)}
          placeholder={t("taskDescriptionPlaceholder")} />
      </Field>

      <Field label={t("taskCategory")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => set("category", cat)}
              style={form.category === cat ? s.chipActive : s.chip}>
              {cat}
            </button>
          ))}
        </div>
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label={t("taskPayment")}>
          <div style={s.inputRow}>
            <input type="number" min="0.000001" step="0.001"
              style={{ ...inputStyle, borderRadius: "10px 0 0 10px", borderRight: "none", flex: 1 }}
              value={form.sol} onChange={e => set("sol", e.target.value)} />
            <span style={s.unit}>SOL</span>
          </div>
          <span style={{ fontSize: 10, color: "var(--subtle)", marginTop: 4 }}>
            ≈ {Math.round(parseFloat(form.sol || 0) * 1e9).toLocaleString()} lamps
          </span>
        </Field>

        <Field label={t("taskDeadline")}>
          <input type="date" style={inputStyle}
            value={form.deadline}
            min={new Date().toISOString().split("T")[0]}
            onChange={e => set("deadline", e.target.value)} />
        </Field>
      </div>

      {error && <p style={{ color: "var(--red)", fontSize: 12 }}>{error}</p>}
    </Modal>
  );
}

const s = {
  chip:       { padding: "6px 14px", borderRadius: 999, background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 12, cursor: "pointer", minHeight: 34 },
  chipActive: { padding: "6px 14px", borderRadius: 999, background: "rgba(167,139,250,0.15)", color: "var(--accent2)", border: "1px solid rgba(167,139,250,0.4)", fontSize: 12, cursor: "pointer", minHeight: 34 },
  inputRow:   { display: "flex", alignItems: "stretch" },
  unit:       { padding: "0 12px", display: "flex", alignItems: "center", color: "var(--muted)", fontSize: 12, background: "var(--surface2)", borderRadius: "0 10px 10px 0", border: "1px solid var(--border)", borderLeft: "none" },
};