import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";
import {
  fetchLegacyProjectFromSeeds,
  findOrgAccountPda,
  initializeLegacyProject,
  initializeOrg,
} from "../../../src/generated";
import { createUmi } from "../../setup";
import { mintTransferableNftAndVerifyCollection } from "../../../src";

describe("Transferable Projects", () => {
  const umi = createUmi();

  const superAdminAddress = generateSigner(umi).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();
  const nftId = 1;
  const nftIdStr = nftId.toString();

  const orgControlSigner = generateSigner(umi);
  const orgControlAddress = orgControlSigner.publicKey;

  beforeAll(async () => {
    await initializeOrg(umi, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(umi);

    await umi.rpc.airdrop(orgControlAddress, sol(1));
  });

  it("creates a transferable project", async () => {
    await initializeLegacyProject(umi, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      name: "Name",
      symbol: "Symbol",
      uri: "Uri",
      projectType: "t",
    }).sendAndConfirm(umi);

    const transferableProject = await fetchLegacyProjectFromSeeds(umi, {
      orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
      projectId: projectIdStr,
      type: "t-proj",
    });

    expect(transferableProject.projectId).toEqual(createBigInt(projectId));
  });

  it("mints an nft", async () => {
    await mintTransferableNftAndVerifyCollection(umi, {
      authority: orgControlSigner,
      receiver: superAdminAddress,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      nftIdStr,
      name: "",
      symbol: "",
      uri: "",
    }).sendAndConfirm(umi);
  });
});
