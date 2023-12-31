import { createSplAccountCompressionProgram } from "@metaplex-foundation/mpl-bubblegum";
import {
  createSplAssociatedTokenProgram,
  createSplTokenProgram,
} from "@metaplex-foundation/mpl-toolbox";
import {
  createUmi as baseCreateUmi,
  createSignerFromKeypair,
  keypairIdentity,
  publicKey,
  sol,
} from "@metaplex-foundation/umi";
import { defaultPlugins } from "@metaplex-foundation/umi-bundle-defaults";
import { Keypair } from "@solana/web3.js";

import { initializeOwner } from "../src/generated";
import underdogSecretKey from "./keypairs/underdog-test.json";
import { createMplInscriptionProgram, createShard, findInscriptionShardPda } from "@metaplex-foundation/mpl-inscription";

export const createContext = () => {
  const context = baseCreateUmi().use(
    defaultPlugins("http://localhost:8899", { commitment: "processed" })
  );

  const underdogKeypair = Keypair.fromSecretKey(
    Uint8Array.from(underdogSecretKey)
  );

  context.use(
    keypairIdentity(
      createSignerFromKeypair(context, {
        publicKey: publicKey(underdogKeypair.publicKey.toBase58()),
        secretKey: underdogKeypair.secretKey,
      })
    )
  );
  context.programs.add(createSplTokenProgram());
  context.programs.add(createSplAssociatedTokenProgram());
  context.programs.add(createSplAccountCompressionProgram());
  context.programs.add(createMplInscriptionProgram());

  return context;
};

async function globalSetup() {
  console.log("\nGlobal setup...");

  const context = await createContext();

  console.log("Requesting airdrop...");
  await context.rpc.airdrop(context.identity.publicKey, sol(10));

  console.log("Initializing program owner...");
  await initializeOwner(context, {}).sendAndConfirm(context);

  const shardAccount = findInscriptionShardPda(context, { shardNumber: 0 });
  await createShard(context, {
    shardAccount,
    shardNumber: 0,
  }).sendAndConfirm(context);
}

export default globalSetup;
