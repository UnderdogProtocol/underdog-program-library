import { createSplAccountCompressionProgram } from "@metaplex-foundation/mpl-bubblegum";
import {
  createSplAssociatedTokenProgram,
  createSplTokenProgram,
} from "@metaplex-foundation/mpl-toolbox";
import { keypairIdentity, sol } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { initializeOwner } from "../src/generated";
import underdogSecretKey from "./keypairs/underdog-test.json";
import {
  createMplInscriptionProgram,
  createShard,
  findInscriptionShardPda,
} from "@metaplex-foundation/mpl-inscription";

export const createContext = () => {
  const context = createUmi("http://localhost:8899", "processed");

  context.use(
    keypairIdentity(
      context.eddsa.createKeypairFromSecretKey(
        Uint8Array.from(underdogSecretKey)
      )
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

  const context = createContext();

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
