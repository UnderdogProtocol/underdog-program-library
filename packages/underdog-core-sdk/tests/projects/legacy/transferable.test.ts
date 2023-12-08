import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";

import { mintTransferableNftAndVerifyCollection } from "../../../src";
import {
  fetchLegacyProjectFromSeeds,
  findOrgAccountPda,
  initializeLegacyProjectV1,
  initializeOrgV1,
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

  beforeAll(async () => {
    await initializeOrgV1(context, {
      superAdminAddress,
      orgId: orgId,
    }).sendAndConfirm(context);
  });

  it("creates a transferable project", async () => {
    await initializeLegacyProjectV1(context, {
      superAdminAddress,
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
      receiver: superAdminAddress,
      superAdminAddress,
      orgId,
      projectIdStr,
      nftIdStr,
      name: "",
      symbol: "",
      uri: "",
    }).sendAndConfirm(context);
  });
});
