import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";
import {
  fetchCompressedProjectFromSeeds,
  findOrgAccountPda,
  initializeCompressedProject,
  initializeCompressedProjectV1,
  initializeOrg,
  initializeOrgV1,
  mintCompressedNft,
  mintCompressedNftV1,
} from "../../../src/generated";
import { createContext } from "../../setup";
import { createTree } from "../../../src";
import { fetchTreeConfigFromSeeds } from "@metaplex-foundation/mpl-bubblegum";

describe("Compressed Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();

  const merkleTreeSigner = generateSigner(context);
  const merkleTree = merkleTreeSigner.publicKey;
  const maxDepth = 3;
  const maxBufferSize = 8;

  const owner = generateSigner(context).publicKey;

  const name = "Compressed Project NFT";
  const symbol = "CPN";
  const uri = "https://google.com";

  beforeAll(async () => {
    await initializeOrgV1(context, {
      superAdminAddress,
      orgId: orgId,
    }).sendAndConfirm(context);

    await (
      await createTree(context, {
        maxDepth,
        maxBufferSize,
        merkleTree: merkleTreeSigner,
      })
    ).sendAndConfirm(context);
  });

  it("initializes a compressed project", async () => {
    await initializeCompressedProjectV1(context, {
      superAdminAddress,
      orgId,
      projectIdStr,
      name,
      symbol,
      uri,
    }).sendAndConfirm(context);

    const compressedProject = await fetchCompressedProjectFromSeeds(context, {
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      projectId: projectIdStr,
    });

    expect(compressedProject.projectId).toEqual(createBigInt(projectId));
  });

  it("mints a compressed nft", async () => {
    await mintCompressedNftV1(context, {
      recipient: owner,
      merkleTree,
      superAdminAddress,
      orgId,
      projectIdStr,
      name,
      symbol,
      uri,
    }).sendAndConfirm(context);

    const treeConfig = await fetchTreeConfigFromSeeds(context, { merkleTree });
    expect(treeConfig.numMinted).toEqual(createBigInt(1));
  });
});
