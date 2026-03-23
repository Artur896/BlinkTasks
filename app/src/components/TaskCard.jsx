import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { useLanguage } from "../hooks/useLanguage.jsx";
import { getProgram } from "../anchor.js";
import { shortenAddress, lamportsToSol, formatDeadline, getTaskStatus, STATUS_KEY, STATUS_COLOR } from "../utils/helpers.js";

const MAX_RESUBMITS  = 3;
const TIMEOUT_SECS   = 7 * 24 * 3600;

export function TaskCard({ task, index = 0, onAccept, onSubmitDelivery, onApprove, onReportError, onCancel, getUsername, onProfileClick }) {
  const wallet      = useWallet();
  const { t, lang } = useLanguage();
  const data        = task.account;
  const status      = getTaskStatus(data);
  const color       = STATUS_COLOR[status];

  const isCreator  = wallet.publicKey && data.creator.toString() === wallet.publicKey.toString();
  const isWorker   = wallet.publicKey && data.worker.toString()  === wallet.publicKey.toString();
  const hasWorker  = data.worker.toString() !== anchor.web3.PublicKey.default.toString();
  const deadline   = formatDeadline(data.deadline, lang);

  const resubmitCount      = data.resubmitCount ?? 0;
  const submittedAt        = data.submittedAt   ?? 0;
  const resubmitsLeft      = MAX_RESUBMITS - resubmitCount;
  const resubmitsExhausted = resubmitCount >= MAX_RESUBMITS;

  const now            = Math.floor(Date.now() / 1000);
  const secondsElapsed = submittedAt > 0 ? now - submittedAt : 0;
  const timeoutReached = submittedAt > 0 && secondsElapsed >= TIMEOUT_SECS;
  const daysLeft       = submittedAt > 0
    ? Math.max(0, Math.ceil((TIMEOUT_SECS - secondsElapsed) / 86400))
    : null;

  // Nombres resueltos directamente del caché sincrónico
  const creatorName = getUsername?.(data.creator.toString()) ?? null;
  const workerName  = hasWorker ? (getUsername?.(data.worker.toString()) ?? null) : null;
  const [deliveryUrl,  setDeliveryUrl]  = useState("");
  const [errorNote,    setErrorNote]    = useState("");
  const [rating,       setRating]       = useState(5);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showError,    setShowError]    = useState(false);
  const [showApprove,  setShowApprove]  = useState(false);
  const [txLoading,    setTxLoading]    = useState(false);



  const displayName = (pubkey, resolved, isMe) => {
    const name = resolved || shortenAddress(pubkey);
    return isMe ? `${name} (${lang === "es" ? "tú" : "you"})` : name;
  };

  const handleClaimTimeout = async () => {
    setTxLoading(true);
    try {
      const program         = getProgram(wallet);
      const creatorPubkey   = new anchor.web3.PublicKey(data.creator.toString());
      const [vaultPda]      = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creatorPubkey.toBuffer()], program.programId
      );
      const [workerProfile] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), wallet.publicKey.toBuffer()], program.programId
      );
      await program.methods.claimAfterTimeout()
        .accounts({ task: task.publicKey, worker: wallet.publicKey, workerProfile, vault: vaultPda, systemProgram: SystemProgram.programId })
        .rpc();
      await onApprove(task.publicKey, data.creator, data.worker, 0);
    } catch (e) { console.error(e); }
    finally { setTxLoading(false); }
  };

  const handleCancelDispute = async () => {
    setTxLoading(true);
    try {
      const program       = getProgram(wallet);
      const creatorPubkey = new anchor.web3.PublicKey(data.creator.toString());
      const [vaultPda]    = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), creatorPubkey.toBuffer()], program.programId
      );
      await program.methods.cancelDispute()
        .accounts({ task: task.publicKey, creator: wallet.publicKey, vault: vaultPda, systemProgram: SystemProgram.programId })
        .rpc();
      await onCancel(task.publicKey, data.creator);
    } catch (e) { console.error(e); }
    finally { setTxLoading(false); }
  };

  return (
    <div className={`task-card ${status === "disputed" ? "task-card-disputed" : ""} ${status === "paid" ? "task-card-paid" : ""}`} style={{
      "--i": Math.min(index, 8),
      background: "var(--card-bg)",
      border: `1px solid ${status === "disputed" ? "rgba(255,95,109,0.4)" : "var(--border)"}`,
      borderRadius: 14,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      boxShadow: "var(--shadow)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="task-card-id" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--subtle)", transition: "color 0.25s" }}>
            #{String(data.taskId).padStart(3, "0")}
          </span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, border: "1px solid", fontFamily: "'DM Mono', monospace", background: `${color}18`, color, borderColor: `${color}44` }}>
            {data.category}
          </span>
          {(status === "disputed" || (status === "submitted" && resubmitCount > 0)) && (
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 999,
              fontFamily: "'DM Mono', monospace",
              background: resubmitsExhausted ? "rgba(255,95,109,0.15)" : "rgba(245,158,11,0.15)",
              color:      resubmitsExhausted ? "#ff5f6d" : "#f59e0b",
              border:     `1px solid ${resubmitsExhausted ? "rgba(255,95,109,0.3)" : "rgba(245,158,11,0.3)"}`,
            }}>
              {resubmitCount}/{MAX_RESUBMITS}
            </span>
          )}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, fontSize: 11, background: `${color}15`, color, border: `1px solid ${color}33` }}>
          <span className={status === "open" ? "dot-pulse" : ""} style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
          {t(STATUS_KEY[status])}
        </div>
      </div>

      {/* Title + description */}
      <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", lineHeight: 1.3, margin: 0 }}>
        {data.title}
      </p>
      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
        {data.description}
      </p>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 8, borderTop: "1px solid var(--surface2)" }}>
        <MetaItem label={t("payment")} value={`${lamportsToSol(data.amount)} SOL`} />
        {deadline && <MetaItem label={t("deadline")} value={deadline} color="var(--amber)" />}
        {status === "submitted" && daysLeft !== null && (
          <MetaItem
            label={lang === "es" ? "Tiempo para revisar" : "Review window"}
            value={timeoutReached
              ? (lang === "es" ? "⚠ Expirado" : "⚠ Expired")
              : (lang === "es" ? `${daysLeft}d restantes` : `${daysLeft}d left`)}
            color={daysLeft <= 1 ? "var(--red)" : "var(--amber)"}
          />
        )}
        <ClickableUser label={lang === 'es' ? 'Cliente' : 'Client'}
          name={displayName(data.creator, creatorName, isCreator)}
          color={isCreator ? "var(--accent2)" : "var(--muted)"}
          onClick={() => onProfileClick?.(data.creator.toString())} />
        {hasWorker && (
          <ClickableUser label={lang === 'es' ? 'Trabajador' : 'Worker'}
            name={displayName(data.worker, workerName, isWorker)}
            color={isWorker ? "var(--green)" : "var(--muted)"}
            onClick={() => onProfileClick?.(data.worker.toString())} />
        )}
      </div>

      {/* Entrega visible */}
      {data.deliveryUrl && ["submitted", "disputed", "paid"].includes(status) && (
        <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("workerDelivery")}</span>
          <a href={data.deliveryUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--accent)", wordBreak: "break-all", textDecoration: "none" }}>
            {data.deliveryUrl}
          </a>
        </div>
      )}

      {/* Nota de error */}
      {data.errorNote && status === "disputed" && (
        <div style={{ background: "rgba(255,95,109,0.08)", border: "1px solid rgba(255,95,109,0.25)", borderRadius: 8, padding: "10px 14px" }}>
          <span style={{ fontSize: 11, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t("reportedProblem")}
          </span>
          <p style={{ fontSize: 13, color: "var(--red)", opacity: 0.8, marginTop: 4, lineHeight: 1.5 }}>{data.errorNote}</p>
          {resubmitsExhausted && (
            <p style={{ fontSize: 11, color: "var(--amber)", marginTop: 6 }}>
              {lang === "es"
                ? "⚠ El worker agotó sus 3 intentos. Puedes cancelar y recuperar el SOL."
                : "⚠ Worker exhausted 3 attempts. You can cancel and recover SOL."}
            </p>
          )}
        </div>
      )}

      {/* ── ACCIONES ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        {status === "open" && !isCreator && (
          <ActionBtn color="#7c6dff" onClick={() => onAccept(task.publicKey)}>{t("acceptTask")}</ActionBtn>
        )}

        {status === "open" && isCreator && (
          <ActionBtn color="#6b6b8a" onClick={() => onCancel(task.publicKey, data.creator)}>{t("cancelTask")}</ActionBtn>
        )}

        {isWorker && status === "inProgress" && (
          showDelivery ? (
            <InputGroup value={deliveryUrl} onChange={setDeliveryUrl}
              placeholder={t("deliveryPlaceholder")}
              onConfirm={async () => {
                if (!deliveryUrl.trim()) return;
                await onSubmitDelivery(task.publicKey, deliveryUrl);
                setDeliveryUrl(""); setShowDelivery(false);
              }}
              onCancel={() => setShowDelivery(false)}
              confirmLabel={t("sendDelivery")} confirmColor="#22d3a5" />
          ) : (
            <ActionBtn color="#22d3a5" onClick={() => setShowDelivery(true)}>{t("submitDelivery")}</ActionBtn>
          )
        )}

        {isWorker && status === "disputed" && !resubmitsExhausted && (
          <div>
            <p style={{ fontSize: 11, color: "#f59e0b", marginBottom: 6 }}>
              {lang === "es" ? `Intentos restantes: ${resubmitsLeft} de ${MAX_RESUBMITS}` : `Attempts left: ${resubmitsLeft} of ${MAX_RESUBMITS}`}
            </p>
            {showDelivery ? (
              <InputGroup value={deliveryUrl} onChange={setDeliveryUrl}
                placeholder={t("deliveryPlaceholder")}
                onConfirm={async () => {
                  if (!deliveryUrl.trim()) return;
                  const program = getProgram(wallet);
                  await program.methods.submitDeliveryRetry(deliveryUrl)
                    .accounts({ task: task.publicKey, worker: wallet.publicKey })
                    .rpc();
                  setDeliveryUrl(""); setShowDelivery(false);
                  await onSubmitDelivery(task.publicKey, "");
                }}
                onCancel={() => setShowDelivery(false)}
                confirmLabel={t("resubmitDelivery")} confirmColor="#f59e0b" />
            ) : (
              <ActionBtn color="#f59e0b" onClick={() => setShowDelivery(true)}>{t("resubmitDelivery")}</ActionBtn>
            )}
          </div>
        )}

        {isWorker && status === "disputed" && resubmitsExhausted && (
          <p style={{ fontSize: 12, color: "#ff5f6d", textAlign: "center", padding: "8px 0" }}>
            {lang === "es" ? "Agotaste tus 3 intentos. El cliente puede cancelar la tarea." : "You exhausted your 3 attempts. The client may cancel the task."}
          </p>
        )}

        {isWorker && status === "submitted" && timeoutReached && (
          <ActionBtn color="#22d3a5" onClick={handleClaimTimeout} disabled={txLoading}>
            {txLoading ? "..." : (lang === "es" ? "Reclamar pago (7 días sin respuesta)" : "Claim payment (7 day timeout)")}
          </ActionBtn>
        )}

        {isCreator && status === "submitted" && (
          showApprove ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("rateWork")}</span>
              <StarPicker value={rating} onChange={setRating} />
              <div style={{ display: "flex", gap: 6 }}>
                <ActionBtn color="#22d3a5" onClick={async () => {
                  await onApprove(task.publicKey, data.creator, data.worker, rating);
                  setShowApprove(false);
                }}>{t("confirmPayment")}</ActionBtn>
                <button onClick={() => setShowApprove(false)} style={{ padding: "9px 12px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, cursor: "pointer" }}>✕</button>
              </div>
            </div>
          ) : (
            <ActionBtn color="#22d3a5" onClick={() => setShowApprove(true)}>{t("approveAndPay")}</ActionBtn>
          )
        )}

        {isCreator && status === "submitted" && !resubmitsExhausted && !showApprove && (
          showError ? (
            <InputGroup textarea value={errorNote} onChange={setErrorNote}
              placeholder={t("errorPlaceholder")}
              onConfirm={async () => {
                if (!errorNote.trim()) return;
                await onReportError(task.publicKey, errorNote);
                setErrorNote(""); setShowError(false);
              }}
              onCancel={() => setShowError(false)}
              confirmLabel={t("reportError")} confirmColor="#ff5f6d" />
          ) : (
            <ActionBtn color="#ff5f6d" onClick={() => setShowError(true)}>
              {t("reportProblem")} ({resubmitsLeft} {lang === "es" ? "restantes" : "left"})
            </ActionBtn>
          )
        )}

        {isCreator && (status === "disputed" || status === "submitted") && resubmitsExhausted && (
          <ActionBtn color="#ff5f6d" onClick={handleCancelDispute} disabled={txLoading}>
            {txLoading ? "..." : (lang === "es" ? "Cancelar disputa y recuperar SOL" : "Cancel dispute and recover SOL")}
          </ActionBtn>
        )}
      </div>
    </div>
  );
}

function InputGroup({ textarea, value, onChange, placeholder, onConfirm, onCancel, confirmLabel, confirmColor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {textarea ? (
        <textarea style={inputSt} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input style={inputSt} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <ActionBtn color={confirmColor} onClick={onConfirm}>{confirmLabel}</ActionBtn>
        <button onClick={onCancel} style={{ padding: "9px 12px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, cursor: "pointer" }}>✕</button>
      </div>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)}
          style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", color: "#f59e0b", opacity: n <= value ? 1 : 0.25, transition: "opacity 0.15s" }}>
          ★
        </button>
      ))}
    </div>
  );
}

function ClickableUser({ label, name, color, onClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 12, color: color || "var(--muted)", fontFamily: "'DM Mono', monospace", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>
          {name}
        </span>
      </button>
    </div>
  );
}

function MetaItem({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 12, color: color || "var(--text)", fontFamily: "'DM Mono', monospace" }}>{value}</span>
    </div>
  );
}

function ActionBtn({ color, onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: "100%", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: "'Syne', sans-serif", background: `${color}20`, color, border: `1px solid ${color}44`, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "background 0.2s, box-shadow 0.2s, transform 0.15s" }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = `${color}32`; e.currentTarget.style.boxShadow = `0 4px 16px ${color}28`; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; } }}>
      {children}
    </button>
  );
}

const inputSt = {
  width: "100%", background: "var(--input-bg)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "10px 12px", color: "var(--text)",
  fontSize: 13, fontFamily: "'DM Mono', monospace",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
};