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
import { createUmi } from "./setup";

describe("Orgs", () => {
  const umi = createUmi();

  const superAdminAddress = generateSigner(umi).publicKey;
  const orgId = "1";
  const orgControlAddress = generateSigner(umi).publicKey;
  const memberAddress = generateSigner(umi).publicKey;

  it("should initialize org", async () => {
    await initializeOrg(umi, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(umi);

    const orgAccount = await fetchOrgAccountFromSeeds(umi, {
      superAdminAddress,
      orgId,
    });
    expect(orgAccount.owner).toEqual(superAdminAddress);
    expect(orgAccount.counter).toEqual(createBigInt(orgId));

    const orgControlAccount = await fetchOrgControlAccountFromSeeds(umi, {
      superAdminAddress,
      orgId,
    });
    expect(orgControlAccount.orgControl).toEqual(orgControlAddress);

    const orgMemberAccount = await fetchOrgMemberAccountFromSeeds(umi, {
      orgAccount: orgAccount.publicKey,
      member: superAdminAddress,
    });
    expect(orgMemberAccount.member).toEqual(superAdminAddress);
    expect(orgMemberAccount.active).toEqual(true);
  });

  it("should add org member", async () => {
    await addOrgMember(umi, {
      superAdminAddress,
      orgId,
      memberAddress,
    }).sendAndConfirm(umi);

    const orgMemberAccount = await fetchOrgMemberAccountFromSeeds(umi, {
      orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
      member: memberAddress,
    });
    expect(orgMemberAccount.member).toEqual(memberAddress);
    expect(orgMemberAccount.active).toEqual(true);
  });

  it("should update org member to inactive", async () => {
    await updateOrgMember(umi, {
      superAdminAddress,
      orgId,
      memberAddress,
      active: false
    }).sendAndConfirm(umi);

    const orgMemberAccount = await fetchOrgMemberAccountFromSeeds(umi, {
      orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
      member: memberAddress,
    });
    expect(orgMemberAccount.active).toEqual(false);
  });
});
