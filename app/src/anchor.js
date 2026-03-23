import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "./idl/blinktasks.json";

const NETWORK    = "https://api.devnet.solana.com";

export const getProgram = (wallet) => {
  const connection = new Connection(NETWORK, "confirmed");

  const provider = new AnchorProvider(
    connection,
    {
      publicKey:           wallet.publicKey,
      signTransaction:     wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    { preflightCommitment: "confirmed" }
  );

  // Anchor 0.30+ requiere pasar el programId explícitamente
  return new Program(idl,provider);
};