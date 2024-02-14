import { createSplAssociatedTokenProgram, createSplTokenProgram } from "@metaplex-foundation/mpl-toolbox";
import {
  createUmi,
  createSignerFromKeypair,
  keypairIdentity,
  publicKey,
  sol,
} from "@metaplex-foundation/umi";
import { defaultPlugins } from "@metaplex-foundation/umi-bundle-defaults";
import { Keypair } from "@solana/web3.js";

import underdogSecretKey from "./keypairs/underdog-test.json";
import { initializeAdmin } from "../src/generated";

export const createContext = () => {
  const umi = createUmi().use(defaultPlugins("http://localhost:8899", { commitment: "processed" }));

  const underdogKeypair = Keypair.fromSecretKey(Uint8Array.from(underdogSecretKey));

  umi.use(
    keypairIdentity(
      createSignerFromKeypair(umi, {
        publicKey: publicKey(underdogKeypair.publicKey.toBase58()),
        secretKey: underdogKeypair.secretKey,
      })
    )
  );
  umi.programs.add(createSplTokenProgram());
  umi.programs.add(createSplAssociatedTokenProgram());

  return umi;
};

async function globalSetup() {
  console.log("\nGlobal setup...");

  const context = await createContext();

  console.log("Requesting airdrop...");
  await context.rpc.airdrop(context.identity.publicKey, sol(10));

  console.log("Initializing program admin...");
  await initializeAdmin(context, {}).sendAndConfirm(context);
}

export default globalSetup;
