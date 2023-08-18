
import { generateSigner, signerIdentity, sol } from "@metaplex-foundation/umi";
import { fetchInitialOwnerFromSeeds, updateOwner } from "../src/generated";
import { createUmi } from "./setup";

describe("Initialize Owner", () => {
  const umi = createUmi();

  const ownerSigner = umi.identity;
  const tempOwnerSigner = generateSigner(umi);

  beforeAll(async () => {
    await umi.rpc.airdrop(tempOwnerSigner.publicKey, sol(1));
  });

  it("initializes program owner", async () => {
    const initialOwnerAccount = await fetchInitialOwnerFromSeeds(umi);
    expect(initialOwnerAccount.owner).toEqual(umi.identity.publicKey);
  });

  it("updates program owner", async () => {
    await updateOwner(umi, { newOwner: tempOwnerSigner.publicKey }).sendAndConfirm(umi);

    const initialOwnerAccount = await fetchInitialOwnerFromSeeds(umi);
    expect(initialOwnerAccount.owner).toEqual(tempOwnerSigner.publicKey);

    umi.use(signerIdentity(tempOwnerSigner));
  });

  afterAll(async () => {
    await updateOwner(umi, { newOwner: ownerSigner.publicKey }).sendAndConfirm(umi);
  });
});
