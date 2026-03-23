import { useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { getProgram } from "../anchor.js";

const MAX_CACHE = 500;
const profileCache = new Map();

function setCacheLRU(key, value) {
  if (profileCache.size >= MAX_CACHE) {
    profileCache.delete(profileCache.keys().next().value);
  }
  profileCache.set(key, value);
}

export function useProfiles() {
  const wallet  = useWallet();
  const [tick, setTick] = useState(0); // fuerza re-render cuando el cache cambia
  const pending = useRef(new Set());

  const resolveUsername = useCallback(async (pubkeyStr) => {
    if (!pubkeyStr || !wallet.publicKey) return null;

    // Si ya está en caché, retornar inmediatamente
    if (profileCache.has(pubkeyStr)) return profileCache.get(pubkeyStr);
    if (pending.current.has(pubkeyStr)) return null;

    pending.current.add(pubkeyStr);
    try {
      const program = getProgram(wallet);
      const pubkey  = new anchor.web3.PublicKey(pubkeyStr);
      const [pda]   = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), pubkey.toBuffer()],
        program.programId
      );
      const data = await program.account.userProfile.fetch(pda);
      setCacheLRU(pubkeyStr, data.username);
      setTick(t => t + 1); // ← fuerza re-render en todos los componentes que usen el hook
      return data.username;
    } catch {
      setCacheLRU(pubkeyStr, null);
      return null;
    } finally {
      pending.current.delete(pubkeyStr);
    }
  }, [wallet.publicKey]);

  const resolveMany = useCallback(async (pubkeys) => {
    const unique = [...new Set(pubkeys)].filter(p => p && !profileCache.has(p));
    await Promise.all(unique.map(resolveUsername));
  }, [resolveUsername]);

  // getUsername es sincrónico — lee del caché directamente
  const getUsername = useCallback((pubkeyStr) => {
    return profileCache.get(pubkeyStr) ?? null;
  }, [tick]); // ← se actualiza cuando tick cambia

  return { resolveUsername, resolveMany, getUsername };
}