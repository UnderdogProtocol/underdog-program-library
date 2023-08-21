
import { generateSigner, signerIdentity, sol } from "@metaplex-foundation/umi";
import { createContext } from "./setup";
import { fetchAdminFromSeeds, updateAdmin } from "../src/generated";

describe("Initialize Admin", () => {
  const context = createContext();

  const adminSigner = context.identity;
  const tempAdminSigner = generateSigner(context);

  beforeAll(async () => {
    await context.rpc.airdrop(tempAdminSigner.publicKey, sol(1));
  });

  it("initializes program admin", async () => {
    const admin = await fetchAdminFromSeeds(context);
    expect(admin.address).toEqual(context.identity.publicKey);
  });

  it("updates program admin", async () => {
    await updateAdmin(context, { newAdmin: tempAdminSigner.publicKey }).sendAndConfirm(context);

    const admin = await fetchAdminFromSeeds(context);
    expect(admin.address).toEqual(tempAdminSigner.publicKey);

    context.use(signerIdentity(tempAdminSigner));
  });

  afterAll(async () => {
    await updateAdmin(context, { newAdmin: adminSigner.publicKey }).sendAndConfirm(context);
  });
});
