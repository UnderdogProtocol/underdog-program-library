import { PublicKey, publicKeyBytes } from "@metaplex-foundation/umi";
import {
  hashProjectAsset,
  toLeafHashes,
  transferAssetV2,
  verifyAsset,
} from "../../src";
import {
  generateMetadataMock,
  generateProjectMock,
  generateRandomAddress,
  setupNft,
  setupProject,
  setupTree,
} from "../mocks";
import { createContext } from "../setup";
import {
  getMerkleProofAtIndex,
  getMerkleRoot,
} from "@metaplex-foundation/mpl-bubblegum";

const context = createContext();

const { superAdminAddress, projectId, orgId } = generateProjectMock(context);
const projectInput = { superAdminAddress, projectId, orgId };

const ownerAddress = generateRandomAddress(context);

const maxDepth = 3;
let treeAddress: PublicKey;
beforeAll(async () => {
  treeAddress = await setupTree(context);
  await setupProject(context, projectInput);
});

describe("Transfer Delegated NFT", () => {
  it("transfers asset", async () => {
    const metadata = generateMetadataMock();

    const assets = await setupNft(context, {
      treeAddress,
      ownerAddress,
      delegated: true,
      metadata,
      ...projectInput,
    });

    const leafIndex = 0;

    const leaves = toLeafHashes(assets);
    const [{ data, creator }] = assets;

    await transferAssetV2(context, {
      newLeafOwner: superAdminAddress,
      leafOwner: ownerAddress,
      merkleTree: treeAddress,
      superAdminAddress,
      orgId: orgId.toString(),
      projectId,
      root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
      dataHash: data,
      leafIndex,
      creatorHash: creator,
      proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex),
    }).sendAndConfirm(context);

    const assetHash = hashProjectAsset(context, {
      ...projectInput,
      treeAddress,
      leafIndex: 0,
      ownerAddress: superAdminAddress,
      ...metadata,
    });

    await verifyAsset(context, { treeAddress, assets: [assetHash] });
  });
});
