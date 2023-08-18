/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  findMasterEditionPda,
  findMetadataPda,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  AccountMeta,
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  mapSerializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { findLegacyNftPda } from '@underdog-protocol/spl-utils';
import {
  findLegacyProjectPda,
  findOrgAccountPda,
  findOrgControlAccountPda,
  findOrgMemberAccountPda,
} from '../accounts';
import { PickPartial, addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type BurnNonTransferableNftInstructionAccounts = {
  authority?: Signer;
  orgAccount?: PublicKey | Pda;
  orgControlAccount?: PublicKey | Pda;
  memberAccount?: PublicKey | Pda;
  nonTransferableProject?: PublicKey | Pda;
  nonTransferableProjectMint?: PublicKey | Pda;
  nonTransferableProjectMetadata?: PublicKey | Pda;
  nonTransferableNftMint?: Pda;
  nonTransferableNftMetadata?: PublicKey | Pda;
  nonTransferableNftMasterEdition?: PublicKey | Pda;
  nonTransferableNftEscrow?: Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  associatedTokenProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type BurnNonTransferableNftInstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  memberAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  nftMintBump: number;
  nftEscrowBump: number;
};

export type BurnNonTransferableNftInstructionDataArgs = {
  superAdminAddress: PublicKey;
  memberAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  nftMintBump: number;
  nftEscrowBump: number;
};

/** @deprecated Use `getBurnNonTransferableNftInstructionDataSerializer()` without any argument instead. */
export function getBurnNonTransferableNftInstructionDataSerializer(
  _context: object
): Serializer<
  BurnNonTransferableNftInstructionDataArgs,
  BurnNonTransferableNftInstructionData
>;
export function getBurnNonTransferableNftInstructionDataSerializer(): Serializer<
  BurnNonTransferableNftInstructionDataArgs,
  BurnNonTransferableNftInstructionData
>;
export function getBurnNonTransferableNftInstructionDataSerializer(
  _context: object = {}
): Serializer<
  BurnNonTransferableNftInstructionDataArgs,
  BurnNonTransferableNftInstructionData
> {
  return mapSerializer<
    BurnNonTransferableNftInstructionDataArgs,
    any,
    BurnNonTransferableNftInstructionData
  >(
    struct<BurnNonTransferableNftInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['memberAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectIdStr', string()],
        ['nftIdStr', string()],
        ['nftMintBump', u8()],
        ['nftEscrowBump', u8()],
      ],
      { description: 'BurnNonTransferableNftInstructionData' }
    ),
    (value) => ({ ...value, discriminator: [200, 74, 13, 74, 30, 30, 45, 133] })
  ) as Serializer<
    BurnNonTransferableNftInstructionDataArgs,
    BurnNonTransferableNftInstructionData
  >;
}

// Args.
export type BurnNonTransferableNftInstructionArgs = PickPartial<
  BurnNonTransferableNftInstructionDataArgs,
  'nftMintBump' | 'nftEscrowBump'
>;

// Instruction.
export function burnNonTransferableNft(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: BurnNonTransferableNftInstructionAccounts &
    BurnNonTransferableNftInstructionArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'underdogCore',
    'updg8JyjrmFE2h3d71p71zRXDR8q4C6Up8dDoeq3LTM'
  );

  // Resolved inputs.
  const resolvedAccounts = {};
  const resolvingArgs = {};
  addObjectProperty(
    resolvedAccounts,
    'authority',
    input.authority
      ? ([input.authority, true] as const)
      : ([context.identity, true] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'orgAccount',
    input.orgAccount
      ? ([input.orgAccount, false] as const)
      : ([
          findOrgAccountPda(context, {
            superAdminAddress: input.superAdminAddress,
            orgId: input.orgId,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'orgControlAccount',
    input.orgControlAccount
      ? ([input.orgControlAccount, true] as const)
      : ([
          findOrgControlAccountPda(context, {
            superAdminAddress: input.superAdminAddress,
            orgId: input.orgId,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'memberAccount',
    input.memberAccount
      ? ([input.memberAccount, false] as const)
      : ([
          findOrgMemberAccountPda(context, {
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            member: input.memberAddress,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'nonTransferableProject',
    input.nonTransferableProject
      ? ([input.nonTransferableProject, true] as const)
      : ([
          findLegacyProjectPda(context, {
            type: 'nt-proj',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'nonTransferableProjectMint',
    input.nonTransferableProjectMint
      ? ([input.nonTransferableProjectMint, false] as const)
      : ([
          findLegacyProjectPda(context, {
            type: 'nt-project-mint',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'nonTransferableProjectMetadata',
    input.nonTransferableProjectMetadata
      ? ([input.nonTransferableProjectMetadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(
              resolvedAccounts.nonTransferableProjectMint[0],
              false
            ),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'nonTransferableNftMint',
    input.nonTransferableNftMint
      ? ([input.nonTransferableNftMint, true] as const)
      : ([
          findLegacyNftPda(context, {
            prefix: 'nt-nft-mint',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
            nftId: input.nftIdStr,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'nonTransferableNftMetadata',
    input.nonTransferableNftMetadata
      ? ([input.nonTransferableNftMetadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(resolvedAccounts.nonTransferableNftMint[0], false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'nonTransferableNftMasterEdition',
    input.nonTransferableNftMasterEdition
      ? ([input.nonTransferableNftMasterEdition, true] as const)
      : ([
          findMasterEditionPda(context, {
            mint: publicKey(resolvedAccounts.nonTransferableNftMint[0], false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'nonTransferableNftEscrow',
    input.nonTransferableNftEscrow
      ? ([input.nonTransferableNftEscrow, true] as const)
      : ([
          findLegacyNftPda(context, {
            prefix: 'nt-nft-mint-esc',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
            nftId: input.nftIdStr,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'tokenMetadataProgram',
    input.tokenMetadataProgram
      ? ([input.tokenMetadataProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'mplTokenMetadata',
            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
          ),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'associatedTokenProgram',
    input.associatedTokenProgram
      ? ([input.associatedTokenProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splAssociatedToken',
            'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
          ),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'tokenProgram',
    input.tokenProgram
      ? ([input.tokenProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splToken',
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
          ),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'systemProgram',
    input.systemProgram
      ? ([input.systemProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splSystem',
            '11111111111111111111111111111111'
          ),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'rent',
    input.rent
      ? ([input.rent, false] as const)
      : ([
          publicKey('SysvarRent111111111111111111111111111111111'),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvingArgs,
    'nftMintBump',
    input.nftMintBump ?? resolvedAccounts.nonTransferableNftMint[0][1]
  );
  addObjectProperty(
    resolvingArgs,
    'nftEscrowBump',
    input.nftEscrowBump ?? resolvedAccounts.nonTransferableNftEscrow[0][1]
  );
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.orgAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.orgControlAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.memberAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.nonTransferableProject, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.nonTransferableProjectMint,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.nonTransferableProjectMetadata,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.nonTransferableNftMint, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.nonTransferableNftMetadata,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.nonTransferableNftMasterEdition,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.nonTransferableNftEscrow,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.associatedTokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);

  // Data.
  const data =
    getBurnNonTransferableNftInstructionDataSerializer().serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
