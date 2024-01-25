import { faker } from "@faker-js/faker";
import {
  PublicKey,
  Umi,
  generateSigner,
  publicKeyBytes,
} from "@metaplex-foundation/umi";
import {
  AssetHash,
  OrgInput,
  ProjectInput,
  findProjectMintAddress,
  hashProjectAsset,
  initializeOrgV1,
  initializeProjectV1,
  initializeTree,
  mintNftV5,
  mintSftV4,
  toLeafHashes,
} from "../src";
import {
  fetchTreeConfigFromSeeds,
  getMerkleProofAtIndex,
  getMerkleRoot,
  getMerkleTreeSize,
  verifyLeaf,
} from "@metaplex-foundation/mpl-bubblegum";
import { createAccount } from "@metaplex-foundation/mpl-toolbox";
import { fetchMetadataFromSeeds } from "@metaplex-foundation/mpl-token-metadata";

export const generateRandomAddress = (context: Umi) =>
  generateSigner(context).publicKey;

export const generateProjectMock = (context: Umi) => ({
  superAdminAddress: generateRandomAddress(context),
  orgId: 1,
  projectId: 1,
});

export type Metadata = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
};

export const generateMetadataMock = (
  { sellerFeeBasisPoints } = { sellerFeeBasisPoints: 0 }
) => ({
  name: faker.animal.cat().slice(0, 32),
  symbol: faker.animal.cat().slice(0, 8),
  uri: faker.internet.url(),
  sellerFeeBasisPoints,
});

export const setupTree = async (context: Umi) => {
  const maxDepth = 3;
  const maxBufferSize = 8;

  const space = getMerkleTreeSize(3, 8);
  const lamports = await context.rpc.getRent(space);

  const merkleTreeSigner = generateSigner(context);

  await createAccount(context, {
    newAccount: merkleTreeSigner,
    lamports,
    space,
    programId: context.programs.getPublicKey("splAccountCompression"),
  })
    .add(
      initializeTree(context, {
        merkleTree: merkleTreeSigner,
        maxDepth,
        maxBufferSize,
      })
    )
    .sendAndConfirm(context);

  return merkleTreeSigner.publicKey;
};

export const setupOrg = async (
  context: Umi,
  { superAdminAddress, orgId }: OrgInput
) => {
  await initializeOrgV1(context, {
    superAdminAddress,
    orgId: orgId.toString(),
  }).sendAndConfirm(context);
};

export const setupProject = async (
  context: Umi,
  projectInput: ProjectInput
) => {
  await setupOrg(context, projectInput);

  const metadata = generateMetadataMock();

  await initializeProjectV1(context, {
    ...metadata,
    ...projectInput,
    orgId: projectInput.orgId.toString(),
  }).sendAndConfirm(context);

  return metadata;
};

export type AssetInput = ProjectInput & {
  treeAddress: PublicKey;
  ownerAddress: PublicKey;
  assets?: AssetHash[];
  delegated?: boolean;
  metadata?: Metadata;
};

export const setupNft = async (
  context: Umi,
  {
    treeAddress,
    ownerAddress,
    delegated = false,
    assets = [],
    metadata = generateMetadataMock(),
    ...projectInput
  }: AssetInput
) => {
  const projectMintAddress = findProjectMintAddress(context, projectInput);

  await mintNftV5(context, {
    ...projectInput,
    orgId: projectInput.orgId.toString(),
    recipient: ownerAddress,
    merkleTree: treeAddress,
    isDelegated: delegated,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    collectionMint: projectMintAddress,
    share: 0,
  }).sendAndConfirm(context);

  const assetHash = hashProjectAsset(context, {
    ownerAddress,
    treeAddress,
    leafIndex: assets.length,
    delegated,
    ...projectInput,
    ...metadata,
  });

  return [...assets, assetHash];
};

export const setupSft = async (
  context: Umi,
  {
    treeAddress,
    ownerAddress,
    delegated = false,
    assets = [],
    ...projectInput
  }: AssetInput
) => {
  const projectMintAddress = findProjectMintAddress(context, projectInput);
  const { name, symbol, uri, sellerFeeBasisPoints } =
    await fetchMetadataFromSeeds(context, { mint: projectMintAddress });

  await mintSftV4(context, {
    ...projectInput,
    orgId: projectInput.orgId.toString(),
    recipient: ownerAddress,
    merkleTree: treeAddress,
    isDelegated: delegated,
    collectionMint: projectMintAddress,
  }).sendAndConfirm(context);

  const assetHash = hashProjectAsset(context, {
    ownerAddress,
    treeAddress,
    leafIndex: assets.length,
    name,
    symbol,
    uri,
    sellerFeeBasisPoints,
    delegated,
    ...projectInput,
  });

  return [...assets, assetHash];
};
