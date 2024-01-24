import {
  PublicKey,
  generateSigner,
  publicKey,
  publicKeyBytes,
} from "@metaplex-foundation/umi";
import { createContext } from "../setup";
import {
  fetchProject,
  findOrgAddress,
  findProjectAddress,
  findProjectMintAddress,
  hashProjectNft,
  initializeOrgV1,
  initializeProjectV1,
  mintNftV5,
  updateAssetV0,
} from "../../src";
import {
  createTree,
  fetchTreeConfigFromSeeds,
  getMerkleProofAtIndex,
  getMerkleRoot,
  verifyLeaf,
} from "@metaplex-foundation/mpl-bubblegum";
import { fetchMetadataFromSeeds } from "@metaplex-foundation/mpl-token-metadata";

describe("Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = 1;
  const projectId = 1;

  const orgInput = { superAdminAddress, orgId };
  const projectInput = { ...orgInput, projectId };

  const orgAddress = findOrgAddress(context, orgInput);

  const projectAddress = findProjectAddress(context, projectInput);
  const projectMintAddress = findProjectMintAddress(context, projectInput);

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
  const leafIndex = 0;

  beforeAll(async () => {
    await initializeOrgV1(context, {
      superAdminAddress,
      orgId: orgId.toString(),
    }).sendAndConfirm(context);

    await (
      await createTree(context, {
        maxDepth,
        maxBufferSize,
        merkleTree: merkleTreeSigner,
      })
    ).sendAndConfirm(context);

    await initializeProjectV1(context, {
      superAdminAddress,
      orgId: orgId.toString(),
      projectId,
      name: "",
      symbol: "",
      uri: "",
      sellerFeeBasisPoints,
    }).sendAndConfirm(context);
  });

  describe("Mint NFT", () => {
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
      delegated: false,
    });

    beforeAll(async () => {
      await mintNftV5(context, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId: orgId.toString(),
        projectId,
        name,
        symbol,
        uri,
        isDelegated: false,
        collectionMint: projectMintAddress,
        share: 0,
      }).sendAndConfirm(context);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(context, {
        merkleTree,
      });
      expect(Number(treeConfig.numMinted)).toEqual(leafIndex + 1);
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

  describe("Update NFT", () => {
    const updatedMetadata = {
      name: "Updated Name",
      symbol: "UPDATE",
      uri: "Updated Uri",
      sellerFeeBasisPoints,
    };

    it("can update", async () => {
      await updateAssetV0(context, {
        collectionMint: projectMintAddress,
        leafOwner: owner,
        leafDelegate: owner,
        merkleTree,
        superAdminAddress,
        orgId: orgId.toString(),
        projectId,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        currentMetadata: {
          name,
          symbol,
          uri,
          sellerFeeBasisPoints,
          creators: [
            {
              address: projectAddress,
              verified: true,
              share: 100,
            },
            {
              address: orgAddress,
              verified: true,
              share: 0,
            },
          ],
        },
        updatedMetadata,
        leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(context);
    });

    it("can verify leaf", async () => {
      const { leafHash } = hashProjectNft(context, {
        superAdminAddress,
        orgId,
        projectId,
        owner,
        merkleTree,
        leafIndex,
        ...updatedMetadata,
      });

      leaves[0] = publicKey(leafHash);

      await verifyLeaf(context, {
        merkleTree,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        leaf: publicKeyBytes(leaves[leafIndex]),
        index: leafIndex,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(context);
    });
  });
});
