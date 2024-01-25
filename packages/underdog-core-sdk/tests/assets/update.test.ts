import {
  PublicKey,
  generateSigner,
  publicKeyBytes,
} from "@metaplex-foundation/umi";
import { createContext } from "../setup";
import {
  findProjectAddresses,
  getProjectCreators,
  hashProjectAsset,
  toLeafHashes,
  updateAssetV0,
  verifyAsset,
} from "../../src";
import {
  getMerkleProofAtIndex,
  getMerkleRoot,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  generateMetadataMock,
  generateProjectMock,
  setupNft,
  setupProject,
  setupTree,
} from "../mocks";

const context = createContext();

const { superAdminAddress, projectId, orgId } = generateProjectMock(context);
const projectInput = { superAdminAddress, projectId, orgId };

const { projectMintAddress } = findProjectAddresses(context, projectInput);

const ownerAddress = generateSigner(context).publicKey;

const metadata = generateMetadataMock();

let treeAddress: PublicKey;
beforeAll(async () => {
  treeAddress = await setupTree(context);
  await setupProject(context, projectInput);
});

const leafIndex = 0;

describe("Update Asset", () => {
  const updatedMetadata = generateMetadataMock();

  it("updates asset", async () => {
    const assets = await setupNft(context, {
      treeAddress,
      ownerAddress,
      metadata,
      ...projectInput,
    });

    const leaves = toLeafHashes(assets);

    await updateAssetV0(context, {
      ...projectInput,
      orgId: orgId.toString(),
      collectionMint: projectMintAddress,
      leafOwner: ownerAddress,
      leafDelegate: ownerAddress,
      merkleTree: treeAddress,
      currentMetadata: {
        ...metadata,
        creators: getProjectCreators(context, projectInput),
      },
      updatedMetadata,
      leafIndex,
      root: publicKeyBytes(getMerkleRoot(leaves, 3)),
      proof: getMerkleProofAtIndex(leaves, 3, leafIndex),
    }).sendAndConfirm(context);
  });

  it("verifies updated asset", async () => {
    const assetHash = hashProjectAsset(context, {
      ownerAddress,
      treeAddress,
      leafIndex,
      ...projectInput,
      ...updatedMetadata,
    });

    await verifyAsset(context, { treeAddress, assets: [assetHash] });
  });
});
