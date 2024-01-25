import { PublicKey, generateSigner } from "@metaplex-foundation/umi";
import { createContext } from "../setup";
import { fetchTreeConfigFromSeeds } from "@metaplex-foundation/mpl-bubblegum";
import {
  generateProjectMock,
  setupNft,
  setupProject,
  setupTree,
  verifyAsset,
} from "../mocks";

const context = createContext();

const { superAdminAddress, projectId, orgId } = generateProjectMock(context);
const projectInput = { superAdminAddress, projectId, orgId };

const ownerAddress = generateSigner(context).publicKey;

let treeAddress: PublicKey;
beforeAll(async () => {
  treeAddress = await setupTree(context);
  await setupProject(context, projectInput);
});

describe("Mint NFT", () => {
  it("verifies asset", async () => {
    const assets = await setupNft(context, {
      ...projectInput,
      treeAddress,
      ownerAddress,
      delegated: false,
    });

    await verifyAsset(context, { treeAddress, assets });
  });

  it("increments number of minted nfts", async () => {
    const treeConfig = await fetchTreeConfigFromSeeds(context, {
      merkleTree: treeAddress,
    });

    expect(Number(treeConfig.numMinted)).toEqual(1);
  });
});
