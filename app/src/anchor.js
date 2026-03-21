import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "./idl/blinktasks.json" assert { type: "json" };
console.log("IDL:", idl);

const programID = new PublicKey("An6HpDp4ypTZB1mKEFzmvXyHSP1oBPf2KeG9J2MkP2my");

const network = "http://127.0.0.1:8899";

export const getProgram = (wallet) => {
  const connection = new web3.Connection(network, "processed");
  
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    { preflightCommitment: "processed" }
  );

  return new Program(idl, provider);
};