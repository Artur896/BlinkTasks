import * as anchor from "@coral-xyz/anchor";

export const DEFAULT_PUBKEY = anchor.web3.PublicKey.default.toString();

export function shortenAddress(addr, chars = 4) {
  const s = addr.toString();
  return `${s.slice(0, chars)}…${s.slice(-chars)}`;
}

export function lamportsToSol(lamports) {
  return (Number(lamports) / 1e9).toFixed(4);
}

export function formatDeadline(ts, lang = "es") {
  if (!ts || Number(ts) === 0) return null;
  const locale = lang === "es" ? "es-MX" : "en-US";
  return new Date(Number(ts) * 1000).toLocaleDateString(locale, {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function getTaskStatus(data) {
  return Object.keys(data.status)[0];
}

// Status label keys — se resuelven con t() en los componentes
export const STATUS_KEY = {
  open:        "statusOpen",
  inProgress:  "statusInProgress",
  submitted:   "statusSubmitted",
  disputed:    "statusDisputed",
  paid:        "statusPaid",
  cancelled:   "statusCancelled",
};

export const STATUS_COLOR = {
  open:        "#7c6dff",
  inProgress:  "#f59e0b",
  submitted:   "#a78bfa",
  disputed:    "#ff5f6d",
  paid:        "#22d3a5",
  cancelled:   "#6b6b8a",
};