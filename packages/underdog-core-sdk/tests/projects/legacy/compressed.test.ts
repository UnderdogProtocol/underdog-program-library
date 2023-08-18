import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";
import {
  fetchCompressedProjectFromSeeds,
  findOrgAccountPda,
  initializeCompressedProject,
  initializeOrg,
  mintCompressedNft,
} from "../../../src/generated";
import { createUmi } from "../../setup";
import { createTree } from "../../../src";
import { fetchTreeConfigFromSeeds } from "@metaplex-foundation/mpl-bubblegum";

describe("Compressed Projects", () => {
  const umi = createUmi();

  const superAdminAddress = generateSigner(umi).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();
  const orgControlSigner = generateSigner(umi);
  const orgControlAddress = orgControlSigner.publicKey;

  const merkleTreeSigner = generateSigner(umi);
  const merkleTree = merkleTreeSigner.publicKey;
  const maxDepth = 3;
  const maxBufferSize = 8;

  const owner = generateSigner(umi).publicKey;

  const name = "Compressed Project NFT";
  const symbol = "CPN";
  const uri = "https://google.com";

  beforeAll(async () => {
    await initializeOrg(umi, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(umi);

    await umi.rpc.airdrop(orgControlAddress, sol(10));

    await (
      await createTree(umi, {
        maxDepth,
        maxBufferSize,
        merkleTree: merkleTreeSigner,
      })
    ).sendAndConfirm(umi);
  });

  it("initializes a compressed project", async () => {
    await initializeCompressedProject(umi, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      name,
      symbol,
      uri,
    }).sendAndConfirm(umi);

    const compressedProject = await fetchCompressedProjectFromSeeds(umi, {
      orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
      projectId: projectIdStr,
    });

    expect(compressedProject.projectId).toEqual(createBigInt(projectId));
  });

  it("mints a compressed nft", async () => {
    await mintCompressedNft(umi, {
      recipient: owner,
      merkleTree,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      name,
      symbol,
      uri,
    }).sendAndConfirm(umi);

    const treeConfig = await fetchTreeConfigFromSeeds(umi, { merkleTree });
    expect(treeConfig.numMinted).toEqual(createBigInt(1));
  });
});
