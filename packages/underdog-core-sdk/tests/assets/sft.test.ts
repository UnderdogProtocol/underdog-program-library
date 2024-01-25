import { PublicKey, generateSigner } from "@metaplex-foundation/umi";
import { createContext } from "../setup";
import { fetchTreeConfigFromSeeds } from "@metaplex-foundation/mpl-bubblegum";
import {
  Metadata,
  generateProjectMock,
  setupProject,
  setupSft,
  setupTree,
} from "../mocks";
import { verifyAsset } from "../../src";

const context = createContext();

const { superAdminAddress, projectId, orgId } = generateProjectMock(context);
const projectInput = { superAdminAddress, projectId, orgId };

const ownerAddress = generateSigner(context).publicKey;

let treeAddress: PublicKey;
let projectMetadata: Metadata;
beforeAll(async () => {
  treeAddress = await setupTree(context);
  projectMetadata = await setupProject(context, projectInput);
});

describe("Mint SFT", () => {
  it("verifies asset", async () => {
    const assets = await setupSft(context, {
      ownerAddress,
      treeAddress,
      ...projectInput,
    });

    await verifyAsset(context, { treeAddress, assets });
  });

  it("increments number of minted assets", async () => {
    const treeConfig = await fetchTreeConfigFromSeeds(context, {
      merkleTree: treeAddress,
    });

    expect(Number(treeConfig.numMinted)).toEqual(1);
  });
});
