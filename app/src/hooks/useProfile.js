import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { getProgram } from "../anchor.js";

export function useProfile() {
  const wallet = useWallet();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(false);

  const getProfilePda = useCallback(() => {
    if (!wallet.publicKey) return null;
    const program = getProgram(wallet);
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), wallet.publicKey.toBuffer()],
      program.programId
    );
    return pda;
  }, [wallet.publicKey]);

  const checkProfile = useCallback(async () => {
    if (!wallet.publicKey) return;
    setChecking(true);
    try {
      const program = getProgram(wallet);
      const data = await program.account.userProfile.fetch(getProfilePda());
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setChecking(false);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (wallet.publicKey) checkProfile();
    else setProfile(null);
  }, [wallet.publicKey]);

  const initProfile = async ({ username, bio, skills, contact }) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    try {
      const program    = getProgram(wallet);
      const profilePda = getProfilePda();
      const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), wallet.publicKey.toBuffer()],
        program.programId
      );
      await program.methods
        .initProfile(username, bio, skills, contact)
        .accounts({ profile: profilePda, user: wallet.publicKey, systemProgram: SystemProgram.programId })
        .rpc();
      await program.methods
        .initVault()
        .accounts({ vault: vaultPda, user: wallet.publicKey, systemProgram: SystemProgram.programId })
        .rpc();
      await checkProfile();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async ({ username, bio, skills, contact }) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    try {
      const program    = getProgram(wallet);
      const profilePda = getProfilePda();
      await program.methods
        .updateProfile(username, bio, skills, contact)
        .accounts({ profile: profilePda, user: wallet.publicKey })
        .rpc();
      await checkProfile();
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, checking, initProfile, updateProfile, checkProfile, getProfilePda };
}