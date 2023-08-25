
import { generateSigner, signerIdentity, sol } from "@metaplex-foundation/umi";
import { fetchInitialOwnerFromSeeds, updateOwner } from "../src/generated";
import { createContext } from "./setup";

describe("Initialize Owner", () => {
  const context = createContext();

  const ownerSigner = context.identity;
  const tempOwnerSigner = generateSigner(context);

  beforeAll(async () => {
    await context.rpc.airdrop(tempOwnerSigner.publicKey, sol(1));
  });

  it("initializes program owner", async () => {
    const initialOwnerAccount = await fetchInitialOwnerFromSeeds(context);
    expect(initialOwnerAccount.owner).toEqual(context.identity.publicKey);
  });

  it("updates program owner", async () => {
    await updateOwner(context, { newOwner: tempOwnerSigner.publicKey }).sendAndConfirm(context);

    const initialOwnerAccount = await fetchInitialOwnerFromSeeds(context);
    expect(initialOwnerAccount.owner).toEqual(tempOwnerSigner.publicKey);

    context.use(signerIdentity(tempOwnerSigner));
  });

  afterAll(async () => {
    await updateOwner(context, { newOwner: ownerSigner.publicKey }).sendAndConfirm(context);
  });
});
