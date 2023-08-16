import * as anchor from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const getProgram = async (
  wallet: anchor.Wallet,
  programId: PublicKey,
  connection: Connection
): Promise<anchor.Program> => {
  let skipPreflight = false;
  if (process.env.REACT_APP_ENV === "dev") {
    skipPreflight = true;
  }
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: "recent",
    skipPreflight,
    commitment: "confirmed",
  });
  const idl = await anchor.Program.fetchIdl(programId, provider);
  const program = new anchor.Program(idl as anchor.Idl, programId, provider);
  return program;
};

export const getMasterEdition = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};

export const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};

export const getTokenFromWallet = async (
  walletKey: PublicKey,
  mint: PublicKey
) => {
  return (
    await PublicKey.findProgramAddress(
      [walletKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
};

export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: PublicKey,
  payer: PublicKey,
  walletAddress: PublicKey,
  splTokenMintAddress: PublicKey
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
};

export const getATokenAddr = async (
  connection: Connection,
  walletKey: PublicKey,
  mint: PublicKey
) => {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletKey,
    { mint }
  );
  if (tokenAccounts.value.length < 1) {
    throw new Error("Wallet doesn't have an account for the mint.");
  }

  let tokenAccount = null;
  for (var i = 0; i < tokenAccounts.value.length; i++) {
    const clientTokenAccountTokenAmount =
      tokenAccounts.value[i].account.data.parsed.info.tokenAmount.uiAmount;
      const clientTokenAccountTokenName =
      tokenAccounts.value[i].account.data.parsed.info.tokenAmount.name;
      tokenAccount = tokenAccounts.value[i];
    
    if (clientTokenAccountTokenAmount < 1) {
      continue;
    }
    
  }
  if (tokenAccount === null) {
    throw new Error("Wallet doesn't contain the token");
  }
  return tokenAccount.pubkey;
};