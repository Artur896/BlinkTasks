import * as anchor from "@coral-xyz/anchor";

export const DEFAULT_PUBKEY = anchor.web3.PublicKey.default.toString();

export function shortenAddress(addr, chars = 4) {
  const s = addr.toString();
  return `${s.slice(0, chars)}…${s.slice(-chars)}`;
}

export function lamportsToSol(lamports) {
  return (Number(lamports) / 1e9).toFixed(4);
}

export function formatDeadline(ts) {
  if (!ts || Number(ts) === 0) return null;
  return new Date(Number(ts) * 1000).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function getTaskStatus(data) {
  const key = Object.keys(data.status)[0];
  return key; // "open" | "inProgress" | "submitted" | "disputed" | "paid" | "cancelled"
}

export const STATUS_LABEL = {
  open:        "Disponible",
  inProgress:  "En progreso",
  submitted:   "Entrega pendiente",
  disputed:    "Disputado",
  paid:        "Pagado",
  cancelled:   "Cancelado",
};

export const STATUS_COLOR = {
  open:        "#7c6dff",
  inProgress:  "#f59e0b",
  submitted:   "#a78bfa",
  disputed:    "#ff5f6d",
  paid:        "#22d3a5",
  cancelled:   "#6b6b8a",
};