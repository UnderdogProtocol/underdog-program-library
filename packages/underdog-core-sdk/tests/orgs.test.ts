import { createBigInt, generateSigner } from "@metaplex-foundation/umi";
import { fetchOrgAccountFromSeeds, initializeOrgV1 } from "../src/generated";
import { createContext } from "./setup";

describe("Orgs", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";

  it("should initialize org", async () => {
    await initializeOrgV1(context, { superAdminAddress, orgId }).sendAndConfirm(
      context
    );

    const orgAccount = await fetchOrgAccountFromSeeds(context, {
      superAdminAddress,
      orgId,
    });
    expect(orgAccount.owner).toEqual(superAdminAddress);
    expect(orgAccount.counter).toEqual(createBigInt(orgId));
  });
});
