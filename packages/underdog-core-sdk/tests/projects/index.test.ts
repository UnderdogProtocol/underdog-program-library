import {
  fetchMerkleTree,
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
  defaultPublicKey,
  generateSigner,
  publicKey,
  publicKeyBytes,
  sol,
} from "@metaplex-foundation/umi";

import {
  createShard,
  fetchInscriptionMetadata,
  fetchInscriptionShardFromSeeds,
  findInscriptionMetadataPda,
  findInscriptionShardPda,
  findMintInscriptionPda,
} from "@metaplex-foundation/mpl-inscription";

import {
  PROJECT_MINT_PREFIX,
  PROJECT_PREFIX,
  createTree,
  findMintPda,
} from "../../src";
import {
  burnAssetV1,
  doStuffV0,
  fetchProjectFromSeeds,
  findOrgAccountPda,
  findProjectPda,
  getProjectSize,
  initializeOrgV1,
  initializeProjectV1,
  inscribeV0,
  mintNftV4,
  mintSftV4,
  transferAssetV2,
  updateProjectV2,
  verifyCollectionV0,
  withdrawProjectRoyaltiesV0,
} from "../../src/generated";
import { hashProjectNft } from "../../src/verify";
import { createContext } from "../setup";

describe("Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const orgAccount = findOrgAccountPda(context, {
    superAdminAddress,
    orgId,
  })[0];

  const projectId = 1;
  const project = findProjectPda(context, {
    prefix: PROJECT_PREFIX,
    orgAccount: orgAccount,
    projectId,
  })[0];
  const projectMint = findProjectPda(context, {
    prefix: PROJECT_MINT_PREFIX,
    orgAccount,
    projectId,
  })[0];

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

  it("initializes a project", async () => {
    await initializeProjectV1(context, {
      superAdminAddress,
      orgId,
      projectId,
      name: "",
      symbol: "",
      uri: "",
      sellerFeeBasisPoints: 0,
    }).sendAndConfirm(context);

    const project = await fetchProjectFromSeeds(context, {
      prefix: PROJECT_PREFIX,
      orgAccount,
      projectId,
    });

    expect(project.projectId).toEqual(createBigInt(projectId));

    const projectMetadata = await fetchMetadataFromSeeds(context, {
      mint: projectMint,
    });

    expect(projectMetadata.name).toEqual("");
    expect(projectMetadata.symbol).toEqual("");
    expect(projectMetadata.uri).toEqual("");
    expect(projectMetadata.sellerFeeBasisPoints).toEqual(0);
  });

  it("can update a project", async () => {
    await updateProjectV2(context, {
      superAdminAddress,
      orgId,
      projectId,
      metadata: {
        name,
        symbol,
        uri,
        sellerFeeBasisPoints,
      },
      collectionMint: projectMint,
    }).sendAndConfirm(context);

    const projectMetadata = await fetchMetadataFromSeeds(context, {
      mint: projectMint,
    });

    expect(projectMetadata.name).toEqual(name);
    expect(projectMetadata.symbol).toEqual(symbol);
    expect(projectMetadata.uri).toEqual(uri);
    expect(projectMetadata.sellerFeeBasisPoints).toEqual(sellerFeeBasisPoints);
  });

  describe("Project Royalties", () => {
    beforeAll(async () => {
      const projectBalance = await context.rpc.getBalance(project);

      expect(projectBalance).toEqual(
        await context.rpc.getRent(getProjectSize())
      );

      await context.rpc.airdrop(project, sol(1));
    });

    it("can withdraw royalties", async () => {
      const destination = generateSigner(context).publicKey;

      await withdrawProjectRoyaltiesV0(context, {
        superAdminAddress,
        orgId,
        projectId,
        destination,
      }).sendAndConfirm(context);

      const projectBalance = await context.rpc.getBalance(project);

      expect(projectBalance).toEqual(
        await context.rpc.getRent(getProjectSize())
      );

      const destinationBalance = await context.rpc.getBalance(destination);
      expect(destinationBalance).toEqual(sol(1));
    });
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
      await mintNftV4(context, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        projectId,
        name,
        symbol,
        uri,
        isDelegated: false,
        collectionMint: projectMint,
      }).sendAndConfirm(context);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(context, {
        merkleTree,
      });
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
      await mintNftV4(context, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        projectId,
        name,
        symbol,
        uri,
        isDelegated: true,
        collectionMint: projectMint,
      }).sendAndConfirm(context);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(context, {
        merkleTree,
      });
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
      await transferAssetV2(context, {
        newLeafOwner: superAdminAddress,
        leafOwner: owner,
        merkleTree,
        superAdminAddress,
        orgId,
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
      await mintSftV4(context, {
        superAdminAddress,
        orgId,
        projectId,
        recipient: owner,
        merkleTree,
        isDelegated: true,
        collectionMint: projectMint,
      }).sendAndConfirm(context);
    });

    it("increments number of minted nfts", async () => {
      const treeConfig = await fetchTreeConfigFromSeeds(context, {
        merkleTree,
      });
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
      await transferAssetV2(context, {
        newLeafOwner: superAdminAddress,
        leafOwner: owner,
        merkleTree,
        superAdminAddress,
        orgId,
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

  describe("Mint & Burn Delegated SFT", () => {
    const leafIndex = 3;

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
      await mintSftV4(context, {
        recipient: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        projectId,
        isDelegated: true,
        collectionMint: projectMint,
      }).sendAndConfirm(context);

      leaves.push(publicKey(leafHash));
    });

    it("can burn sft", async () => {
      await burnAssetV1(context, {
        leafOwner: owner,
        merkleTree,
        superAdminAddress,
        orgId,
        projectId,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        dataHash,
        leafIndex,
        creatorHash: creatorsHash,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
      }).sendAndConfirm(context);

      const merkleTreeAccount = await fetchMerkleTree(context, merkleTree);
      expect(merkleTreeAccount.tree.rightMostPath.leaf).toEqual(
        defaultPublicKey()
      );

      leaves[leafIndex] = defaultPublicKey();
    });
  });

  describe("Mint Normal NFT", () => {
    it("works", async () => {
      await doStuffV0(context, {
        collectionMint: projectMint,
        receiver: superAdminAddress,
        superAdminAddress,
        orgId: "1",
        projectId: 1,
        nftId: 1,
        data: {
          name,
          symbol,
          uri,
          sellerFeeBasisPoints,
        },
      }).sendAndConfirm(context);

      await verifyCollectionV0(context, {
        collectionMint: projectMint,
        superAdminAddress,
        orgId: "1",
        projectId: 1,
        nftId: 1,
      }).sendAndConfirm(context);

      const mintAddress = findMintPda(context, {
        projectAccount: project,
        nftId: 1,
      })[0];

      const metadata = await fetchMetadataFromSeeds(context, {
        mint: mintAddress,
      });

      console.log(metadata);
      console.log(metadata.creators);

      const inscriptionAccount = await findMintInscriptionPda(context, {
        mint: mintAddress,
      });
      const metadataAccount = await findInscriptionMetadataPda(context, {
        inscriptionAccount: inscriptionAccount[0],
      });

      await inscribeV0(context, {
        mint: mintAddress,
        inscriptionMetadata: metadataAccount[0],
        mintInscriptionAccount: findMintInscriptionPda(context, {
          mint: mintAddress,
        }),
        inscriptionShardAccount: findInscriptionShardPda(context, {
          shardNumber: 0,
        }),
        superAdminAddress,
        orgId: "1",
        projectId: 1,
        nftId: 1,
      }).sendAndConfirm(context);

      const inscription = await fetchInscriptionShardFromSeeds(context, {
        shardNumber: 0,
      });

      const inscriptionMetadata = await fetchInscriptionMetadata(context, metadataAccount);
      console.log(inscriptionMetadata);
      console.log(inscription);
    });
  });
});
