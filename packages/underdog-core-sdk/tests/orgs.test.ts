import { createBigInt, generateSigner } from "@metaplex-foundation/umi";
import {
  addOrgMember,
  fetchOrgAccountFromSeeds,
  fetchOrgControlAccountFromSeeds,
  fetchOrgMemberAccountFromSeeds,
  findOrgAccountPda,
  initializeOrg,
  updateOrgMember,
} from "../src/generated";
import { createContext } from "./setup";

describe("Orgs", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const orgControlAddress = generateSigner(context).publicKey;
  const memberAddress = generateSigner(context).publicKey;

  it("should initialize org", async () => {
    await initializeOrg(context, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(context);

    const orgAccount = await fetchOrgAccountFromSeeds(context, {
      superAdminAddress,
      orgId,
    });
    expect(orgAccount.owner).toEqual(superAdminAddress);
    expect(orgAccount.counter).toEqual(createBigInt(orgId));

    const orgControlAccount = await fetchOrgControlAccountFromSeeds(context, {
      superAdminAddress,
      orgId,
    });
    expect(orgControlAccount.orgControl).toEqual(orgControlAddress);

    const orgMemberAccount = await fetchOrgMemberAccountFromSeeds(context, {
      orgAccount: orgAccount.publicKey,
      member: superAdminAddress,
    });
    expect(orgMemberAccount.member).toEqual(superAdminAddress);
    expect(orgMemberAccount.active).toEqual(true);
  });

  it("should add org member", async () => {
    await addOrgMember(context, {
      superAdminAddress,
      orgId,
      memberAddress,
    }).sendAndConfirm(context);

    const orgMemberAccount = await fetchOrgMemberAccountFromSeeds(context, {
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      member: memberAddress,
    });
    expect(orgMemberAccount.member).toEqual(memberAddress);
    expect(orgMemberAccount.active).toEqual(true);
  });

  it("should update org member to inactive", async () => {
    await updateOrgMember(context, {
      superAdminAddress,
      orgId,
      memberAddress,
      active: false
    }).sendAndConfirm(context);

    const orgMemberAccount = await fetchOrgMemberAccountFromSeeds(context, {
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      member: memberAddress,
    });
    expect(orgMemberAccount.active).toEqual(false);
  });
});
