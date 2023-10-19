import { generateSigner, sol } from "@metaplex-foundation/umi";

import {
  activatePassportV0,
  fetchNamespaceFromSeeds,
  initializeNamespaceV0,
} from "../src/generated";
import { createContext } from "./setup";

describe("Initialize Namespace", () => {
  const context = createContext();

  const namespaceSigner = generateSigner(context);
  const passportSigner = generateSigner(context);

  const namespace = "public";
  const identifier = "your@email.com";

  beforeAll(async () => {
    await context.rpc.airdrop(namespaceSigner.publicKey, sol(1));
    await context.rpc.airdrop(passportSigner.publicKey, sol(1));
  });

  it("initializes namespace", async () => {
    await initializeNamespaceV0(context, {
      namespace,
      namespaceAdmin: namespaceSigner,
    }).sendAndConfirm(context);

    const namespaceAccount = await fetchNamespaceFromSeeds(context, {
      namespace,
    });

    expect(namespaceAccount.address).toEqual(namespaceSigner.publicKey);
  });

  it("activates passport with namespace", async () => {
    await activatePassportV0(context, {
      namespaceAdmin: namespaceSigner,
      passportAdmin: passportSigner,
      namespace,
      identifier,
    }).sendAndConfirm(context);
  });
});
