import {
  createUmi as baseCreateUmi,
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  publicKey,
  sol,
} from "@metaplex-foundation/umi";
import { defaultPlugins } from "@metaplex-foundation/umi-bundle-defaults";
import { initializeOwner } from "../src/generated";
import { Keypair } from "@solana/web3.js";
import underdogSecretKey from "./keypairs/underdog-test.json";
import { createSplAssociatedTokenProgram, createSplTokenProgram } from "@metaplex-foundation/mpl-toolbox";

export const createUmi = () => {
  const umi = baseCreateUmi().use(
    defaultPlugins("http://localhost:8899", { commitment: "processed" })
  );

  const underdogKeypair = Keypair.fromSecretKey(
    Uint8Array.from(underdogSecretKey)
  );

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

  const umi = await createUmi();

  console.log("Requesting airdrop...");
  await umi.rpc.airdrop(umi.identity.publicKey, sol(10));

  console.log("Initializing program owner...");
  await initializeOwner(umi, {}).sendAndConfirm(umi);
}

export default globalSetup;
