import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";

import { mintTransferableNftAndVerifyCollection } from "../../../src";
import {
  fetchLegacyProjectFromSeeds,
  findOrgAccountPda,
  initializeLegacyProject,
  initializeOrg,
} from "../../../src/generated";
import { createContext } from "../../setup";

describe("Transferable Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();
  const nftId = 1;
  const nftIdStr = nftId.toString();

  const orgControlSigner = generateSigner(context);
  const orgControlAddress = orgControlSigner.publicKey;

  beforeAll(async () => {
    await initializeOrg(context, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(context);

    await context.rpc.airdrop(orgControlAddress, sol(1));
  });

  it("creates a transferable project", async () => {
    await initializeLegacyProject(context, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      name: "Name",
      symbol: "Symbol",
      uri: "Uri",
      projectType: "t",
    }).sendAndConfirm(context);

    const transferableProject = await fetchLegacyProjectFromSeeds(context, {
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      projectId: projectIdStr,
      type: "t-proj",
    });

    expect(transferableProject.projectId).toEqual(createBigInt(projectId));
  });

  it("mints an nft", async () => {
    await mintTransferableNftAndVerifyCollection(context, {
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
    }).sendAndConfirm(context);
  });
});
