import { generateSigner, sol } from "@metaplex-foundation/umi";

import {
  activatePassportV1,
  fetchDomainFromSeeds,
  initializeDomainV0,
} from "../src/generated";
import { createContext } from "./setup";

jest.setTimeout(60_000);

describe("Initialize Namespace", () => {
  const context = createContext();

  const domainSigner = generateSigner(context);
  const passportSigner = generateSigner(context);

  const namespace = "public";
  const identifier = "your@email.com";

  beforeAll(async () => {
    await context.rpc.airdrop(domainSigner.publicKey, sol(5));
    await context.rpc.airdrop(passportSigner.publicKey, sol(1));
  });

  it("initializes domain", async () => {
    await initializeDomainV0(context, {
      namespace,
      domainAuthority: domainSigner.publicKey,
    }).sendAndConfirm(context);

    const domain = await fetchDomainFromSeeds(context, { namespace });

    expect(domain.authority).toEqual(domainSigner.publicKey);
  });

  it("activates passport with namespace", async () => {
    await activatePassportV1(context, {
      domainAuthority: domainSigner,
      passportAuthority: passportSigner,
      namespace,
      identifier,
    }).sendAndConfirm(context);
  });

  it("activates passport with namespace", async () => {
    await activatePassportV1(context, {
      domainAuthority: domainSigner,
      passportAuthority: passportSigner,
      payer: domainSigner,
      namespace,
      identifier: "payer@email.com",
    }).sendAndConfirm(context);
  });
});
