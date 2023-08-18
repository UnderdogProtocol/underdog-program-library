import {
  TokenProgramVersion,
  TokenStandard,
  hashLeaf,
  hashMetadataCreators,
  hashMetadataData,
} from "@metaplex-foundation/mpl-bubblegum";
import { Context, PublicKey } from "@metaplex-foundation/umi";
import { findOrgAccountPda, findProjectPda } from "./generated";

export const hashProjectNft = (
  context: Pick<Context, "eddsa" | "programs">,
  input: {
    superAdminAddress: PublicKey;
    orgId: string;
    projectId: number;
    merkleTree: PublicKey;
    leafIndex: number;
    owner: PublicKey;
    name: string;
    symbol?: string;
    uri: string;
    delegated?: boolean;
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

  const orgAccountPda = findOrgAccountPda(context, {
    superAdminAddress,
    orgId,
  });

  const projectAccountPda = findProjectPda(context, {
    prefix: "project",
    orgAccount: orgAccountPda[0],
    projectId,
  });

  const projectMintPda = findProjectPda(context, {
    prefix: "project-mint",
    orgAccount: orgAccountPda[0],
    projectId,
  });

  const creators = [
    { address: projectAccountPda[0], verified: true, share: 100 },
    { address: orgAccountPda[0], verified: true, share: 0 },
  ];

  const metadata = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    primarySaleHappened: true,
    isMutable: true,
    editionNonce: 0,
    tokenStandard: TokenStandard.NonFungible,
    collection: {
      key: projectMintPda[0],
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
      delegate: delegated ? projectAccountPda[0] : owner,
      leafIndex,
      metadata,
    }),
    creatorsHash: hashMetadataCreators(creators),
    dataHash: hashMetadataData(metadata)
  };
};
