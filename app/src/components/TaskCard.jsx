import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { shortenAddress, lamportsToSol, formatDeadline, getTaskStatus, STATUS_LABEL, STATUS_COLOR } from "../utils/helpers.js";

export function TaskCard({ task, onAccept, onSubmitDelivery, onApprove, onReportError, onCancel }) {
  const wallet  = useWallet();
  const data    = task.account;
  const status  = getTaskStatus(data);
  const color   = STATUS_COLOR[status];

  const isCreator = wallet.publicKey && data.creator.toString() === wallet.publicKey.toString();
  const isWorker  = wallet.publicKey && data.worker.toString()  === wallet.publicKey.toString();
  const deadline  = formatDeadline(data.deadline);

  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [errorNote,   setErrorNote]   = useState("");
  const [showDelivery, setShowDelivery] = useState(false);
  const [showError,    setShowError]   = useState(false);

  return (
    <div style={{ ...s.card, borderColor: status === "disputed" ? "#ff5f6d44" : "#2a2a3d" }}>

      {/* Header */}
      <div style={s.row}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={s.id}>#{String(data.taskId).padStart(3, "0")}</span>
          <span style={{ ...s.category, background: `${color}15`, color, borderColor: `${color}33` }}>
            {data.category}
          </span>
        </div>
        <StatusPill status={status} color={color} />
      </div>

      {/* Title */}
      <p style={s.taskTitle}>{data.title}</p>

      {/* Description */}
      <p style={s.desc}>{data.description}</p>

      {/* Meta row */}
      <div style={s.metaRow}>
        <div style={s.metaItem}>
          <span style={s.metaLabel}>Pago</span>
          <span style={s.metaValue}>{lamportsToSol(data.amount)} SOL</span>
        </div>
        {deadline && (
          <div style={s.metaItem}>
            <span style={s.metaLabel}>Deadline</span>
            <span style={{ ...s.metaValue, color: "#f59e0b" }}>{deadline}</span>
          </div>
        )}
        <div style={s.metaItem}>
          <span style={s.metaLabel}>Creador</span>
          <span style={{ ...s.metaValue, color: isCreator ? "#a78bfa" : "#6b6b8a" }}>
            {shortenAddress(data.creator)}
          </span>
        </div>
        {data.worker.toString() !== anchor.web3.PublicKey.default.toString() && (
          <div style={s.metaItem}>
            <span style={s.metaLabel}>Worker</span>
            <span style={{ ...s.metaValue, color: isWorker ? "#22d3a5" : "#6b6b8a" }}>
              {shortenAddress(data.worker)}
            </span>
          </div>
        )}
      </div>

      {/* Delivery URL — visible al creador cuando está submitted/disputed/paid */}
      {data.deliveryUrl && (status === "submitted" || status === "disputed" || status === "paid") && (
        <div style={s.deliveryBox}>
          <span style={s.metaLabel}>Entrega del worker</span>
          <a href={data.deliveryUrl} target="_blank" rel="noopener noreferrer" style={s.deliveryLink}>
            {data.deliveryUrl}
          </a>
        </div>
      )}

      {/* Error note — visible cuando hay disputa */}
      {data.errorNote && status === "disputed" && (
        <div style={s.errorBox}>
          <span style={{ fontSize: 11, color: "#ff5f6d", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Nota del cliente
          </span>
          <p style={{ fontSize: 13, color: "#ffaaaa", marginTop: 4 }}>{data.errorNote}</p>
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Aceptar — cualquier worker en Open */}
        {status === "open" && !isCreator && (
          <ActionBtn color="#7c6dff" onClick={() => onAccept(task.publicKey)}>
            Aceptar tarea
          </ActionBtn>
        )}

        {/* Cancelar — creador en Open */}
        {status === "open" && isCreator && (
          <ActionBtn color="#6b6b8a" onClick={() => onCancel(task.publicKey, data.creator)}>
            Cancelar y recuperar SOL
          </ActionBtn>
        )}

        {/* Subir entrega — worker en InProgress o Disputed */}
        {isWorker && (status === "inProgress" || status === "disputed") && (
          <>
            {showDelivery ? (
              <div style={s.inputGroup}>
                <input style={s.inlineInput} value={deliveryUrl}
                  onChange={e => setDeliveryUrl(e.target.value)}
                  placeholder="https://tu-entrega.com o IPFS hash..." />
                <div style={{ display: "flex", gap: 6 }}>
                  <ActionBtn color="#22d3a5" onClick={async () => {
                    if (!deliveryUrl.trim()) return;
                    await onSubmitDelivery(task.publicKey, deliveryUrl);
                    setDeliveryUrl(""); setShowDelivery(false);
                  }}>
                    Enviar entrega
                  </ActionBtn>
                  <button onClick={() => setShowDelivery(false)} style={s.cancelSmall}>Cancelar</button>
                </div>
              </div>
            ) : (
              <ActionBtn color="#22d3a5" onClick={() => setShowDelivery(true)}>
                {status === "disputed" ? "Resubmitir entrega" : "Subir entrega"}
              </ActionBtn>
            )}
          </>
        )}

        {/* Aprobar o reportar error — creador en Submitted */}
        {isCreator && status === "submitted" && (
          <>
            <ActionBtn color="#22d3a5" onClick={() => onApprove(task.publicKey, data.creator, data.worker)}>
              Aprobar y pagar
            </ActionBtn>
            {showError ? (
              <div style={s.inputGroup}>
                <textarea style={{ ...s.inlineInput, height: 70, resize: "vertical" }}
                  value={errorNote}
                  onChange={e => setErrorNote(e.target.value)}
                  placeholder="Describe qué está mal o qué falta..." />
                <div style={{ display: "flex", gap: 6 }}>
                  <ActionBtn color="#ff5f6d" onClick={async () => {
                    if (!errorNote.trim()) return;
                    await onReportError(task.publicKey, errorNote);
                    setErrorNote(""); setShowError(false);
                  }}>
                    Reportar error
                  </ActionBtn>
                  <button onClick={() => setShowError(false)} style={s.cancelSmall}>Cancelar</button>
                </div>
              </div>
            ) : (
              <ActionBtn color="#ff5f6d" onClick={() => setShowError(true)}>
                Reportar problema
              </ActionBtn>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status, color }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, fontSize: 11, background: `${color}15`, color, border: `1px solid ${color}33` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {STATUS_LABEL[status]}
    </div>
  );
}

function ActionBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: "9px", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: "'Syne', sans-serif", background: `${color}18`, color, border: `1px solid ${color}44`, cursor: "pointer", letterSpacing: "0.03em" }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}30`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}18`}>
      {children}
    </button>
  );
}

const s = {
  card:        { background: "#13131a", border: "1px solid", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.18s" },
  row:         { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  id:          { fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#3a3a55" },
  category:    { fontSize: 11, padding: "3px 10px", borderRadius: 999, border: "1px solid", fontFamily: "'DM Mono', monospace" },
  taskTitle:   { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#f0f0fa", lineHeight: 1.3 },
  desc:        { fontSize: 13, color: "#6b6b8a", lineHeight: 1.6 },
  metaRow:     { display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 4, borderTop: "1px solid #1c1c27" },
  metaItem:    { display: "flex", flexDirection: "column", gap: 2 },
  metaLabel:   { fontSize: 10, color: "#3a3a55", textTransform: "uppercase", letterSpacing: "0.08em" },
  metaValue:   { fontSize: 13, color: "#f0f0fa", fontFamily: "'DM Mono', monospace" },
  deliveryBox: { background: "#1c1c27", borderRadius: 8, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 },
  deliveryLink:{ fontSize: 13, color: "#7c6dff", wordBreak: "break-all", textDecoration: "none" },
  errorBox:    { background: "#ff5f6d11", border: "1px solid #ff5f6d33", borderRadius: 8, padding: "10px 14px" },
  inputGroup:  { display: "flex", flexDirection: "column", gap: 8 },
  inlineInput: { width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3d", borderRadius: 8, padding: "10px 12px", color: "#f0f0fa", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box" },
  cancelSmall: { padding: "9px 14px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, cursor: "pointer" },
};