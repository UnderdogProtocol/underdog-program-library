import { getMerkleTreeSize } from "@metaplex-foundation/mpl-bubblegum";
import { findMetadataPda, findMasterEditionPda } from "@metaplex-foundation/mpl-token-metadata";
import { createAccount, createLut } from "@metaplex-foundation/mpl-toolbox";
import { Context, PublicKey, Signer, transactionBuilder } from "@metaplex-foundation/umi";

import { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID } from "@underdog-protocol/spl-utils";

import {
  NON_TRANSFERABLE_PROJECT_MINT_PREFIX,
  NON_TRANSFERABLE_PROJECT_PREFIX,
  NON_TRANSFERABLE_PROJECT_VAULT_PREFIX,
  PROJECT_MINT_PREFIX,
  PROJECT_PREFIX,
  PROJECT_VAULT_PREFIX,
  TRANSFERABLE_PROJECT_MINT_PREFIX,
  TRANSFERABLE_PROJECT_PREFIX,
  TRANSFERABLE_PROJECT_VAULT_PREFIX,
} from "./constants";
import {
  verifyLegacyNftCollection,
  mintTransferableNft,
  initializeTree,
  findOrgAccountPda,
  findProjectPda,
} from "./generated";

export const mintTransferableNftAndVerifyCollection = (
  context: Parameters<typeof mintTransferableNft>[0] &
    Parameters<typeof verifyLegacyNftCollection>[0] &
    Pick<Context, "rpc">,
  input: Omit<
    Parameters<typeof mintTransferableNft>[1] & Parameters<typeof verifyLegacyNftCollection>[1],
    "projectType"
  >
) => {
  const { superAdminAddress, orgId, projectIdStr, nftIdStr, name, symbol, uri } = input;

  return transactionBuilder()
    .add(
      mintTransferableNft(context, {
        authority: input.authority,
        receiver: input.receiver,
        superAdminAddress: input.superAdminAddress,
        memberAddress: input.memberAddress,
        orgId,
        projectIdStr,
        nftIdStr,
        name,
        symbol,
        uri,
      })
    )
    .add(
      verifyLegacyNftCollection(context, {
        authority: input.authority,
        superAdminAddress,
        orgId,
        projectIdStr,
        nftIdStr,
        projectType: "t",
      })
    );
};

export const createTree = async (
  context: Parameters<typeof createAccount>[0] & Parameters<typeof initializeTree>[0] & Pick<Context, "rpc">,
  input: Omit<Parameters<typeof initializeTree>[1], "merkleTree"> & {
    merkleTree: Signer;
    canopyDepth?: number;
  }
) => {
  const space = getMerkleTreeSize(input.maxDepth, input.maxBufferSize, input.canopyDepth);
  const lamports = await context.rpc.getRent(space);

  return transactionBuilder()
    .add(
      createAccount(context, {
        payer: context.payer,
        newAccount: input.merkleTree,
        lamports,
        space,
        programId: context.programs.getPublicKey("splAccountCompression", SPL_ACCOUNT_COMPRESSION_PROGRAM_ID),
      })
    )
    .add(
      initializeTree(context, {
        merkleTree: input.merkleTree,
        maxDepth: input.maxDepth,
        maxBufferSize: input.maxBufferSize,
      })
    );
};

export const createProjectLut = (
  context: Pick<Context, "programs" | "eddsa" | "identity" | "payer">,
  input: { slot: number | bigint; superAdminAddress: PublicKey; orgId: string; projectId: number }
) => {
  const orgAccount = findOrgAccountPda(context, {
    superAdminAddress: input.superAdminAddress,
    orgId: input.orgId,
  });

  const projectMintPda = findProjectPda(context, {
    prefix: PROJECT_MINT_PREFIX,
    orgAccount: orgAccount[0],
    projectId: input.projectId,
  })[0];

  return createLut(context, {
    recentSlot: input.slot,
    addresses: [
      findProjectPda(context, {
        prefix: PROJECT_PREFIX,
        orgAccount: orgAccount[0],
        projectId: input.projectId,
      })[0],
      projectMintPda,
      findProjectPda(context, {
        prefix: PROJECT_VAULT_PREFIX,
        orgAccount: orgAccount[0],
        projectId: input.projectId,
      })[0],
      findMetadataPda(context, { mint: projectMintPda })[0],
      findMasterEditionPda(context, { mint: projectMintPda })[0],
    ],
  });
};

export const createLegacyProjectLut = (
  context: Pick<Context, "programs" | "eddsa" | "identity" | "payer">,
  input: {
    slot: number | bigint;
    superAdminAddress: PublicKey;
    orgId: string;
    projectId: number;
    transferable: boolean;
  }
) => {
  const orgAccount = findOrgAccountPda(context, {
    superAdminAddress: input.superAdminAddress,
    orgId: input.orgId,
  });

  const projectMintPda = findProjectPda(context, {
    prefix: input.transferable ? TRANSFERABLE_PROJECT_MINT_PREFIX : NON_TRANSFERABLE_PROJECT_MINT_PREFIX,
    orgAccount: orgAccount[0],
    projectId: input.projectId,
  })[0];

  return createLut(context, {
    recentSlot: input.slot,
    addresses: [
      findProjectPda(context, {
        prefix: input.transferable ? TRANSFERABLE_PROJECT_PREFIX : NON_TRANSFERABLE_PROJECT_PREFIX,
        orgAccount: orgAccount[0],
        projectId: input.projectId,
      })[0],
      projectMintPda,
      findProjectPda(context, {
        prefix: input.transferable
          ? TRANSFERABLE_PROJECT_VAULT_PREFIX
          : NON_TRANSFERABLE_PROJECT_VAULT_PREFIX,
        orgAccount: orgAccount[0],
        projectId: input.projectId,
      })[0],
      findMetadataPda(context, { mint: projectMintPda })[0],
      findMasterEditionPda(context, { mint: projectMintPda })[0],
    ],
  });
};
