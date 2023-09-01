import {
  fetchTreeConfigFromSeeds,
  getMerkleProof,
  getMerkleProofAtIndex,
  getMerkleRoot,
  verifyLeaf,
} from "@metaplex-foundation/mpl-bubblegum";
import { fetchMetadataFromSeeds } from "@metaplex-foundation/mpl-token-metadata";
import {
  PublicKey,
  createBigInt,
  generateSigner,
  publicKey,
  publicKeyBytes,
  sol,
} from "@metaplex-foundation/umi";

import { PROJECT_MINT_PREFIX, PROJECT_PREFIX, createTree } from "../../src";
import {
  fetchProjectFromSeeds,
  findOrgAccountPda,
  findProjectPda,
  initializeOrg,
  initializeProject,
  initializeProjectV0,
  mintNftV2,
  mintSftV2,
  transferAssetV1,
  updateProjectV0,
} from "../../src/generated";
import { hashProjectNft } from "../../src/verify";
import { createContext } from "../setup";

describe("Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const orgAccount = findOrgAccountPda(context, { superAdminAddress, orgId })[0];

  const orgControlSigner = generateSigner(context);
  const orgControlAddress = orgControlSigner.publicKey;

  const projectId = 1;
  const projectMint = findProjectPda(context, { prefix: PROJECT_MINT_PREFIX, orgAccount, projectId })[0];

  const owner = generateSigner(context).publicKey;

  const merkleTreeSigner = generateSigner(context);
  const merkleTree = merkleTreeSigner.publicKey;
  const maxDepth = 3;
  const maxBufferSize = 8;

  const name = "Project NFT";
  const symbol = "PN";
  const uri = "https://google.com";
  const sellerFeeBasisPoints = 100;

  const leaves: PublicKey[] = [];

  beforeAll(async () => {
    await initializeOrg(context, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(context);

    await context.rpc.airdrop(orgControlAddress, sol(10));

    await (
      await createTree(context, {
        maxDepth,
        maxBufferSize,
        merkleTree: merkleTreeSigner,
      })
    ).sendAndConfirm(context);
  });

  it("initializes a project", async () => {
    await initializeProjectV0(context, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectId,
      name: "",
      symbol: "",
      uri: "",
      sellerFeeBasisPoints: 0
    }).sendAndConfirm(context);

    const project = await fetchProjectFromSeeds(context, {
      prefix: "project",
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      projectId,
    });

    expect(project.projectId).toEqual(createBigInt(projectId));

    const projectMetadata = await fetchMetadataFromSeeds(context, { mint: projectMint });

    expect(projectMetadata.name).toEqual("");
    expect(projectMetadata.symbol).toEqual("");
    expect(projectMetadata.uri).toEqual("");
    expect(projectMetadata.sellerFeeBasisPoints).toEqual(0);
  });

  it("can update a project", async () => {
    await updateProjectV0(context, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectId,
      metadata: {
        name,
        symbol,
        uri,
        sellerFeeBasisPoints,
      },
    }).sendAndConfirm(context);

    const projectMetadata = await fetchMetadataFromSeeds(context, { mint: projectMint });

    expect(projectMetadata.name).toEqual(name);
    expect(projectMetadata.symbol).toEqual(symbol);
    expect(projectMetadata.uri).toEqual(uri);
    expect(projectMetadata.sellerFeeBasisPoints).toEqual(sellerFeeBasisPoints);
  });

  describe("Mint NFT", () => {
    const leafIndex = 0;

    const { leafHash } = hashProjectNft(context, {
      superAdminAddress,
      orgId,
      projectId,
      owner,
      merkleTree,
      leafIndex,
      name,
      symbol,
      uri,
      sellerFeeBasisPoints,
    });

    beforeAll(async () => {
      await mintNftV2(context, {
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
      }).sendAndConfirm(context);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(context, { merkleTree });
      expect(treeConfig.numMinted).toEqual(createBigInt(leafIndex + 1));
    });

    it("can verify leaf", async () => {
      leaves.push(publicKey(leafHash));

      await verifyLeaf(context, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(context);
    });
  });

  describe("Mint & Transfer Delegated NFT", () => {
    const leafIndex = 1;

    const { leafHash, creatorsHash, dataHash } = hashProjectNft(context, {
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
      sellerFeeBasisPoints,
    });

    beforeAll(async () => {
      await mintNftV2(context, {
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
      }).sendAndConfirm(context);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(context, { merkleTree });
      expect(treeConfig.numMinted).toEqual(createBigInt(leafIndex + 1));
    });

    it("can verify leaf", async () => {
      leaves.push(publicKey(leafHash));

      await verifyLeaf(context, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(context);
    });

    it("can transfer and verify nft", async () => {
      await transferAssetV1(context, {
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
      }).sendAndConfirm(context);

      leaves[leafIndex] = publicKey(
        hashProjectNft(context, {
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
          sellerFeeBasisPoints,
        }).leafHash
      );

      await verifyLeaf(context, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProof(leaves, maxDepth, leaves[leafIndex]),
      }).sendAndConfirm(context);
    });
  });

  describe("Mint & Transfer Delegated SFT", () => {
    const leafIndex = 2;

    const { leafHash, creatorsHash, dataHash } = hashProjectNft(context, {
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
      sellerFeeBasisPoints,
    });

    beforeAll(async () => {
      await mintSftV2(context, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        memberAddress: superAdminAddress,
        projectId,
        isDelegated: true,
      }).sendAndConfirm(context);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(context, { merkleTree });
      expect(treeConfig.numMinted).toEqual(createBigInt(leafIndex + 1));
    });

    it("can verify leaf", async () => {
      leaves.push(publicKey(leafHash));

      await verifyLeaf(context, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(context);
    });

    it("can transfer and verify sft", async () => {
      await transferAssetV1(context, {
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
      }).sendAndConfirm(context);

      leaves[leafIndex] = publicKey(
        hashProjectNft(context, {
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
          sellerFeeBasisPoints,
        }).leafHash
      );

      await verifyLeaf(context, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProof(leaves, maxDepth, leaves[leafIndex]),
      }).sendAndConfirm(context);
    });
  });
});
