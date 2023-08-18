import { getMerkleTreeSize } from "@metaplex-foundation/mpl-bubblegum";
import { createAccount } from "@metaplex-foundation/mpl-toolbox";
import { Context, Signer, transactionBuilder } from "@metaplex-foundation/umi";
import { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID } from "@underdog-protocol/spl-utils";
import {
  mintNonTransferableNft,
  verifyLegacyNftCollection,
  mintTransferableNft,
  initializeTree,
} from "./generated";

export const mintNonTransferableNftAndVerifyCollection = (
  context: Parameters<typeof mintNonTransferableNft>[0] &
    Parameters<typeof verifyLegacyNftCollection>[0] &
    Pick<Context, "rpc">,
  input: Omit<
    Parameters<typeof mintNonTransferableNft>[1] &
      Parameters<typeof verifyLegacyNftCollection>[1],
    "projectType"
  >
) => {
  const {
    authority,
    superAdminAddress,
    memberAddress,
    claimerAddress,
    orgId,
    projectIdStr,
    nftIdStr,
    name,
    symbol,
    uri,
  } = input;

  return transactionBuilder()
    .add(
      mintNonTransferableNft(context, {
        authority,
        superAdminAddress,
        memberAddress,
        claimerAddress,
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
        authority,
        superAdminAddress,
        memberAddress,
        orgId,
        projectIdStr,
        nftIdStr,
        projectType: "n",
      })
    );
};

export const mintTransferableNftAndVerifyCollection = (
  context: Parameters<typeof mintTransferableNft>[0] &
    Parameters<typeof verifyLegacyNftCollection>[0] &
    Pick<Context, "rpc">,
  input: Omit<
    Parameters<typeof mintTransferableNft>[1] &
      Parameters<typeof verifyLegacyNftCollection>[1],
    "projectType"
  >
) => {
  const {
    superAdminAddress,
    memberAddress,
    orgId,
    projectIdStr,
    nftIdStr,
    name,
    symbol,
    uri,
  } = input;

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
        memberAddress,
        orgId,
        projectIdStr,
        nftIdStr,
        projectType: "t",
      })
    );
};

export const createTree = async (
  context: Parameters<typeof createAccount>[0] &
    Parameters<typeof initializeTree>[0] &
    Pick<Context, "rpc">,
  input: Omit<Parameters<typeof initializeTree>[1], "merkleTree"> & {
    merkleTree: Signer;
    canopyDepth?: number;
  }
) => {
  const space = getMerkleTreeSize(
    input.maxDepth,
    input.maxBufferSize,
    input.canopyDepth
  );
  const lamports = await context.rpc.getRent(space);

  return transactionBuilder()
    .add(
      createAccount(context, {
        payer: context.payer,
        newAccount: input.merkleTree,
        lamports,
        space,
        programId: context.programs.getPublicKey(
          "splAccountCompression",
          SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
        ),
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
