import { createBigInt, generateSigner } from "@metaplex-foundation/umi";
import {
  convertCompressedProject,
  fetchCompressedProjectFromSeeds,
  findLegacyProjectPda,
  findOrgAccountPda,
  findProjectPda,
  initializeCompressedProjectV1,
  initializeOrgV1,
  mintCompressedNftV1,
  mintNftV4,
  safeFetchCompressedProjectFromSeeds,
  safeFetchProjectFromSeeds,
} from "../../../src/generated";
import { createContext } from "../../setup";
import {
  COMPRESSED_PROJECT_MINT_PREFIX,
  PROJECT_PREFIX,
  PROJECT_VAULT_PREFIX,
  createTree,
} from "../../../src";
import { fetchTreeConfigFromSeeds } from "@metaplex-foundation/mpl-bubblegum";
import { fetchToken } from "@metaplex-foundation/mpl-toolbox";

describe("Compressed Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();

  const orgAccount = findOrgAccountPda(context, {
    superAdminAddress,
    orgId,
  })[0];

  const projectMintAddress = findLegacyProjectPda(context, {
    type: COMPRESSED_PROJECT_MINT_PREFIX,
    orgAccount,
    projectId: projectIdStr,
  })[0];

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
      orgAccount,
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

  it("converts a compressed project to a regular project", async () => {
    await convertCompressedProject(context, {
      superAdminAddress,
      orgId,
      projectIdStr,
      projectId: 10,
      metadata: {
        name,
        symbol,
        uri,
        sellerFeeBasisPoints: 0,
      },
    }).sendAndConfirm(context);

    const compressedProject = await safeFetchCompressedProjectFromSeeds(
      context,
      {
        orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
        projectId: projectIdStr,
      }
    );

    expect(compressedProject).toBeNull();

    const project = await safeFetchProjectFromSeeds(context, {
      prefix: PROJECT_PREFIX,
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      projectId: 10,
    });

    expect(Number(project?.projectId)).toEqual(10);
    expect(project?.superAdminAddress).toEqual(superAdminAddress);

    const projectVault = await findProjectPda(context, {
      prefix: PROJECT_VAULT_PREFIX,
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      projectId: 10,
    })[0];

    const token = await fetchToken(context, projectVault);

    expect(token.amount).toEqual(createBigInt(1));
  });

  it("can mint an NFT after converting", async () => {
    await mintNftV4(context, {
      recipient: owner,
      merkleTree,
      superAdminAddress,
      orgId,
      projectId: 10,
      name,
      symbol,
      uri,
      isDelegated: false,
      collectionMint: projectMintAddress,
    }).sendAndConfirm(context);

    const treeConfig = await fetchTreeConfigFromSeeds(context, { merkleTree });
    expect(treeConfig.numMinted).toEqual(createBigInt(2));
  });
});
