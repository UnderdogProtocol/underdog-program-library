import {
  fetchTreeConfigFromSeeds,
  getMerkleProof,
  getMerkleProofAtIndex,
  getMerkleRoot,
  verifyLeaf,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  PublicKey,
  createBigInt,
  generateSigner,
  publicKey,
  publicKeyBytes,
  sol,
} from "@metaplex-foundation/umi";

import { createTree } from "../../src";
import {
  fetchProjectFromSeeds,
  findOrgAccountPda,
  initializeOrg,
  initializeProject,
  mintNftV2,
  mintSftV2,
  transferAssetV1,
} from "../../src/generated";
import { hashProjectNft } from "../../src/verify";
import { createUmi } from "../setup";

describe("Projects", () => {
  const umi = createUmi();

  const superAdminAddress = generateSigner(umi).publicKey;
  const orgId = "1";
  const projectId = 1;
  const orgControlSigner = generateSigner(umi);
  const orgControlAddress = orgControlSigner.publicKey;

  const owner = generateSigner(umi).publicKey;

  const merkleTreeSigner = generateSigner(umi);
  const merkleTree = merkleTreeSigner.publicKey;
  const maxDepth = 3;
  const maxBufferSize = 8;

  const name = "Project NFT";
  const symbol = "PN";
  const uri = "https://google.com";

  const leaves: PublicKey[] = [];

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

  it("initializes a project", async () => {
    await initializeProject(umi, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectId,
      name,
      symbol,
      uri,
    }).sendAndConfirm(umi);

    const project = await fetchProjectFromSeeds(umi, {
      prefix: "project",
      orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
      projectId,
    });

    expect(project.projectId).toEqual(createBigInt(projectId));
  });

  describe("Mint NFT", () => {
    const leafIndex = 0;

    const { leafHash } = hashProjectNft(umi, {
      superAdminAddress,
      orgId,
      projectId,
      owner,
      merkleTree,
      leafIndex,
      name,
      symbol,
      uri,
    });

    beforeAll(async () => {
      await mintNftV2(umi, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        memberAddress: superAdminAddress,
        projectId,
        name,
        symbol,
        uri,
        isDelegated: false,
      }).sendAndConfirm(umi);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(umi, { merkleTree });
      expect(treeConfig.numMinted).toEqual(createBigInt(leafIndex + 1));
    });

    it("can verify leaf", async () => {
      leaves.push(publicKey(leafHash));

      await verifyLeaf(umi, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(umi);
    });
  });

  describe("Mint & Transfer Delegated NFT", () => {
    const leafIndex = 1;

    const { leafHash, creatorsHash, dataHash } = hashProjectNft(umi, {
      superAdminAddress,
      orgId,
      projectId,
      owner,
      merkleTree,
      leafIndex,
      name,
      symbol,
      uri,
      delegated: true,
    });

    beforeAll(async () => {
      await mintNftV2(umi, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        memberAddress: superAdminAddress,
        projectId,
        name,
        symbol,
        uri,
        isDelegated: true,
      }).sendAndConfirm(umi);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(umi, { merkleTree });
      expect(treeConfig.numMinted).toEqual(createBigInt(leafIndex + 1));
    });

    it("can verify leaf", async () => {
      leaves.push(publicKey(leafHash));

      await verifyLeaf(umi, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(umi);
    });

    it("can transfer and verify nft", async () => {
      await transferAssetV1(umi, {
        newLeafOwner: superAdminAddress,
        leafOwner: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        memberAddress: superAdminAddress,
        projectId,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        dataHash,
        leafIndex,
        creatorHash: creatorsHash,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(umi);

      leaves[leafIndex] = publicKey(
        hashProjectNft(umi, {
          superAdminAddress,
          orgId,
          projectId,
          owner: superAdminAddress,
          merkleTree,
          leafIndex,
          name,
          symbol,
          uri,
          delegated: false,
        }).leafHash
      );

      await verifyLeaf(umi, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProof(leaves, maxDepth, leaves[leafIndex]),
      }).sendAndConfirm(umi);
    });
  });

  describe("Mint & Transfer Delegated SFT", () => {
    const leafIndex = 2;

    const { leafHash, creatorsHash, dataHash } = hashProjectNft(umi, {
      superAdminAddress,
      orgId,
      projectId,
      owner,
      merkleTree,
      leafIndex,
      name,
      symbol,
      uri,
      delegated: true,
    });

    beforeAll(async () => {
      await mintSftV2(umi, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        memberAddress: superAdminAddress,
        projectId,
        isDelegated: true,
      }).sendAndConfirm(umi);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(umi, { merkleTree });
      expect(treeConfig.numMinted).toEqual(createBigInt(leafIndex + 1));
    });

    it("can verify leaf", async () => {
      leaves.push(publicKey(leafHash));

      await verifyLeaf(umi, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(umi);
    });

    it("can transfer and verify sft", async () => {
      await transferAssetV1(umi, {
        newLeafOwner: superAdminAddress,
        leafOwner: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        memberAddress: superAdminAddress,
        projectId,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        dataHash,
        leafIndex,
        creatorHash: creatorsHash,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(umi);

      leaves[leafIndex] = publicKey(
        hashProjectNft(umi, {
          superAdminAddress,
          orgId,
          projectId,
          owner: superAdminAddress,
          merkleTree,
          leafIndex,
          name,
          symbol,
          uri,
          delegated: false,
        }).leafHash
      );

      await verifyLeaf(umi, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProof(leaves, maxDepth, leaves[leafIndex]),
      }).sendAndConfirm(umi);
    });
  });
});
