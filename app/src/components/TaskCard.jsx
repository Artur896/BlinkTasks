import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { shortenAddress, lamportsToSol, formatDeadline, getTaskStatus, STATUS_LABEL, STATUS_COLOR } from "../utils/helpers.js";

export function TaskCard({ task, onAccept, onSubmitDelivery, onApprove, onReportError, onCancel, resolveUsername, onProfileClick }) {
  const wallet  = useWallet();
  const data    = task.account;
  const status  = getTaskStatus(data);
  const color   = STATUS_COLOR[status];

  const isCreator = wallet.publicKey && data.creator.toString() === wallet.publicKey.toString();
  const isWorker  = wallet.publicKey && data.worker.toString()  === wallet.publicKey.toString();
  const deadline  = formatDeadline(data.deadline);
  const hasWorker = data.worker.toString() !== anchor.web3.PublicKey.default.toString();

  const [creatorName, setCreatorName] = useState(null);
  const [workerName,  setWorkerName]  = useState(null);
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [errorNote,   setErrorNote]   = useState("");
  const [rating,      setRating]      = useState(5);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showError,    setShowError]   = useState(false);
  const [showApprove,  setShowApprove] = useState(false);

  // Resolver usernames al montar
  useEffect(() => {
    if (!resolveUsername) return;
    resolveUsername(data.creator.toString()).then(setCreatorName);
    if (hasWorker) resolveUsername(data.worker.toString()).then(setWorkerName);
  }, [data.creator.toString(), data.worker.toString()]);

  const displayName = (pubkey, resolved, isMe) => {
    const name = resolved || shortenAddress(pubkey);
    return isMe ? `${name} (tú)` : name;
  };

  return (
    <div style={{ ...s.card, borderColor: status === "disputed" ? "#ff5f6d44" : "#2a2a3d" }}>

      {/* Header */}
      <div style={s.row}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={s.id}>#{String(data.taskId).padStart(3, "0")}</span>
          <span style={{ ...s.catBadge, background: `${color}15`, color, borderColor: `${color}33` }}>
            {data.category}
          </span>
        </div>
        <StatusPill status={status} color={color} />
      </div>

      {/* Title */}
      <p style={s.taskTitle}>{data.title}</p>
      <p style={s.desc}>{data.description}</p>

      {/* Meta */}
      <div style={s.metaRow}>
        <MetaItem label="Pago" value={`${lamportsToSol(data.amount)} SOL`} />
        {deadline && <MetaItem label="Deadline" value={deadline} color="#f59e0b" />}
        <ClickableUser
          label="Cliente"
          pubkey={data.creator.toString()}
          name={displayName(data.creator, creatorName, isCreator)}
          color={isCreator ? "#a78bfa" : "#6b6b8a"}
          onClick={() => onProfileClick?.(data.creator.toString())}
        />
        {hasWorker && (
          <ClickableUser
            label="Worker"
            pubkey={data.worker.toString()}
            name={displayName(data.worker, workerName, isWorker)}
            color={isWorker ? "#22d3a5" : "#6b6b8a"}
            onClick={() => onProfileClick?.(data.worker.toString())}
          />
        )}
      </div>

      {/* Entrega visible para creador */}
      {data.deliveryUrl && ["submitted", "disputed", "paid"].includes(status) && (
        <div style={s.deliveryBox}>
          <span style={s.smallLabel}>Entrega del worker</span>
          <a href={data.deliveryUrl} target="_blank" rel="noopener noreferrer" style={s.link}>
            {data.deliveryUrl}
          </a>
        </div>
      )}

      {/* Nota de error */}
      {data.errorNote && status === "disputed" && (
        <div style={s.errorBox}>
          <span style={{ fontSize: 11, color: "#ff5f6d", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Problema reportado
          </span>
          <p style={{ fontSize: 13, color: "#ffaaaa", marginTop: 4, lineHeight: 1.5 }}>{data.errorNote}</p>
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        {status === "open" && !isCreator && (
          <ActionBtn color="#7c6dff" onClick={() => onAccept(task.publicKey)}>
            Aceptar tarea
          </ActionBtn>
        )}

        {status === "open" && isCreator && (
          <ActionBtn color="#6b6b8a" onClick={() => onCancel(task.publicKey, data.creator)}>
            Cancelar y recuperar SOL
          </ActionBtn>
        )}

        {isWorker && (status === "inProgress" || status === "disputed") && (
          showDelivery ? (
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
                <button onClick={() => setShowDelivery(false)} style={s.cancelSmall}>✕</button>
              </div>
            </div>
          ) : (
            <ActionBtn color="#22d3a5" onClick={() => setShowDelivery(true)}>
              {status === "disputed" ? "Resubmitir entrega" : "Subir entrega"}
            </ActionBtn>
          )
        )}

        {isCreator && status === "submitted" && (
          <>
            {/* Aprobar con rating */}
            {showApprove ? (
              <div style={s.inputGroup}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={s.smallLabel}>Califica el trabajo (1–5 estrellas)</span>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <ActionBtn color="#22d3a5" onClick={async () => {
                    await onApprove(task.publicKey, data.creator, data.worker, rating);
                    setShowApprove(false);
                  }}>
                    Confirmar pago
                  </ActionBtn>
                  <button onClick={() => setShowApprove(false)} style={s.cancelSmall}>✕</button>
                </div>
              </div>
            ) : (
              <ActionBtn color="#22d3a5" onClick={() => setShowApprove(true)}>
                Aprobar y pagar
              </ActionBtn>
            )}

            {/* Reportar error */}
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
                    Reportar problema
                  </ActionBtn>
                  <button onClick={() => setShowError(false)} style={s.cancelSmall}>✕</button>
                </div>
              </div>
            ) : (
              !showApprove && (
                <ActionBtn color="#ff5f6d" onClick={() => setShowError(true)}>
                  Reportar problema
                </ActionBtn>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          fontSize: 22, background: "none", border: "none",
          cursor: "pointer", opacity: n <= value ? 1 : 0.3,
          transition: "opacity 0.15s",
          filter: n <= value ? "none" : "grayscale(1)",
        }}>★</button>
      ))}
    </div>
  );
}

function StatusPill({ status, color }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, fontSize: 11, background: `${color}15`, color, border: `1px solid ${color}33` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {STATUS_LABEL[status]}
    </div>
  );
}

function ClickableUser({ label, name, color, onClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, color: "#3a3a55", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 12, color: color || "#6b6b8a", fontFamily: "'DM Mono', monospace", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>
          {name}
        </span>
      </button>
    </div>
  );
}

function MetaItem({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, color: "#3a3a55", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 12, color: color || "#f0f0fa", fontFamily: "'DM Mono', monospace" }}>{value}</span>
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
  id:          { fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3a3a55" },
  catBadge:    { fontSize: 11, padding: "3px 10px", borderRadius: 999, border: "1px solid", fontFamily: "'DM Mono', monospace" },
  taskTitle:   { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#f0f0fa", lineHeight: 1.3 },
  desc:        { fontSize: 13, color: "#6b6b8a", lineHeight: 1.6 },
  metaRow:     { display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 8, borderTop: "1px solid #1c1c27" },
  deliveryBox: { background: "#1c1c27", borderRadius: 8, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 },
  link:        { fontSize: 13, color: "#7c6dff", wordBreak: "break-all", textDecoration: "none" },
  errorBox:    { background: "#ff5f6d11", border: "1px solid #ff5f6d33", borderRadius: 8, padding: "10px 14px" },
  inputGroup:  { display: "flex", flexDirection: "column", gap: 8 },
  inlineInput: { width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3d", borderRadius: 8, padding: "10px 12px", color: "#f0f0fa", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box" },
  cancelSmall: { padding: "9px 12px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, cursor: "pointer" },
  smallLabel:  { fontSize: 10, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.08em" },
};