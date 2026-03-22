import { useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { getProgram } from "../anchor.js";

/**
 * Cache global de perfiles pubkey → username
 * Se comparte entre todos los componentes sin context provider
 */
const profileCache = new Map();

export function useProfiles() {
  const wallet = useWallet();
  const [cache, setCache] = useState(profileCache);
  const pending = useRef(new Set());

  const resolveUsername = useCallback(async (pubkeyStr) => {
    if (!pubkeyStr || !wallet.publicKey) return null;
    if (profileCache.has(pubkeyStr)) return profileCache.get(pubkeyStr);
    if (pending.current.has(pubkeyStr)) return null;

    pending.current.add(pubkeyStr);
    try {
      const program  = getProgram(wallet);
      const pubkey   = new anchor.web3.PublicKey(pubkeyStr);
      const [pda]    = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), pubkey.toBuffer()],
        program.programId
      );
      const data = await program.account.userProfile.fetch(pda);
      profileCache.set(pubkeyStr, data.username);
      setCache(new Map(profileCache)); // trigger re-render
      return data.username;
    } catch {
      profileCache.set(pubkeyStr, null); // no tiene perfil
      return null;
    } finally {
      pending.current.delete(pubkeyStr);
    }
  }, [wallet.publicKey]);

  const resolveMany = useCallback(async (pubkeys) => {
    const unique = [...new Set(pubkeys)].filter(p => p && !profileCache.has(p));
    await Promise.all(unique.map(resolveUsername));
  }, [resolveUsername]);

  const getUsername = (pubkeyStr) => profileCache.get(pubkeyStr) ?? null;

  return { resolveUsername, resolveMany, getUsername, cache };
}