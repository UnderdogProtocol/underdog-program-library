import {
  TokenProgramVersion,
  TokenStandard,
  hashLeaf,
  hashMetadataCreators,
  hashMetadataData,
} from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey, Umi } from "@metaplex-foundation/umi";

import { findOrgAddress } from "./orgs";
import { findProjectAddress, findProjectMintAddress } from "./projects";

export const hashProjectNft = (
  context: Umi,
  input: {
    superAdminAddress: PublicKey;
    orgId: number;
    projectId: number;
    merkleTree: PublicKey;
    leafIndex: number;
    owner: PublicKey;
    name: string;
    symbol?: string;
    uri: string;
    delegated?: boolean;
    sellerFeeBasisPoints: number;
  }
) => {
  const {
    superAdminAddress,
    orgId,
    projectId,
    name,
    symbol,
    uri,
    owner,
    merkleTree,
    leafIndex,
    delegated,
  } = input;

  const orgInput = { superAdminAddress, orgId };
  const projectInput = { ...orgInput, projectId };

  const orgAddress = findOrgAddress(context, orgInput);
  const projectAddress = findProjectAddress(context, projectInput);
  const projectMintAddress = findProjectMintAddress(context, projectInput);

  const creators = [
    { address: projectAddress, verified: true, share: 100 },
    { address: orgAddress, verified: true, share: 0 },
  ];

  const metadata = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: input.sellerFeeBasisPoints || 0,
    primarySaleHappened: true,
    isMutable: true,
    editionNonce: 0,
    tokenStandard: TokenStandard.NonFungible,
    collection: {
      key: projectMintAddress,
      verified: true,
    },
    uses: undefined,
    tokenProgramVersion: TokenProgramVersion.Original,
    creators,
  };

  return {
    leafHash: hashLeaf(context, {
      merkleTree,
      owner,
      delegate: delegated ? projectAddress : owner,
      leafIndex,
      metadata,
    }),
    creatorsHash: hashMetadataCreators(creators),
    dataHash: hashMetadataData(metadata),
  };
};
