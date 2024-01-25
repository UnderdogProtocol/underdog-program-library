import {
  TokenProgramVersion,
  TokenStandard,
  hashLeaf,
  hashMetadataCreators,
  hashMetadataData,
} from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey, Umi, publicKey } from "@metaplex-foundation/umi";

import {
  ProjectInput,
  findProjectAddresses,
  getProjectCreators,
} from "./projects";

export type HashAssetInput = ProjectInput & {
  treeAddress: PublicKey;
  leafIndex: number;
  ownerAddress: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  delegated?: boolean;
};

export type AssetHash = {
  leaf: PublicKey;
  creator: Uint8Array;
  data: Uint8Array;
};

export const toLeafHashes = (hashes: AssetHash[]) => hashes.map((h) => h.leaf);

export const defaultMetadata = {

}

export const hashProjectAsset = (
  context: Umi,
  input: HashAssetInput
): AssetHash => {
  const {
    superAdminAddress,
    orgId,
    projectId,
    name,
    symbol,
    uri,
    ownerAddress,
    treeAddress,
    leafIndex,
    delegated,
  } = input;

  const projectInput = { superAdminAddress, orgId, projectId };

  const { projectAddress, projectMintAddress } = findProjectAddresses(
    context,
    projectInput
  );

  const creators = getProjectCreators(context, projectInput);

  const metadata = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: input.sellerFeeBasisPoints || 0,
    primarySaleHappened: true,
    isMutable: true,
    editionNonce: 0,
    tokenStandard: TokenStandard.NonFungible,
    collection: { key: projectMintAddress, verified: true },
    uses: undefined,
    tokenProgramVersion: TokenProgramVersion.Original,
    creators,
  };

  return {
    leaf: publicKey(
      hashLeaf(context, {
        merkleTree: treeAddress,
        owner: ownerAddress,
        delegate: delegated ? projectAddress : ownerAddress,
        leafIndex,
        metadata,
      })
    ),
    creator: hashMetadataCreators(creators),
    data: hashMetadataData(metadata),
  };
};
