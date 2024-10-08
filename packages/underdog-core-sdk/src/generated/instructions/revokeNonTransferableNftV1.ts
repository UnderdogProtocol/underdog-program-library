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
import { findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox';
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
import { findLegacyNftPda } from '../../pdas';
import {
  findInitialOwnerPda,
  findOrgAccountPda,
  findProjAccountPda,
} from '../accounts';
import { PickPartial, addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type RevokeNonTransferableNftV1InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  claimer: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  nonTransferableProject?: PublicKey | Pda;
  nonTransferableNftMint?: Pda;
  nonTransferableNftMetadata?: PublicKey | Pda;
  nonTransferableNftMasterEdition?: PublicKey | Pda;
  nonTransferableNftTokenAccount?: PublicKey | Pda;
  claimerTokenAccount?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  associatedTokenProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type RevokeNonTransferableNftV1InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  nftMintBump: number;
};

export type RevokeNonTransferableNftV1InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  nftMintBump: number;
};

/** @deprecated Use `getRevokeNonTransferableNftV1InstructionDataSerializer()` without any argument instead. */
export function getRevokeNonTransferableNftV1InstructionDataSerializer(
  _context: object
): Serializer<
  RevokeNonTransferableNftV1InstructionDataArgs,
  RevokeNonTransferableNftV1InstructionData
>;
export function getRevokeNonTransferableNftV1InstructionDataSerializer(): Serializer<
  RevokeNonTransferableNftV1InstructionDataArgs,
  RevokeNonTransferableNftV1InstructionData
>;
export function getRevokeNonTransferableNftV1InstructionDataSerializer(
  _context: object = {}
): Serializer<
  RevokeNonTransferableNftV1InstructionDataArgs,
  RevokeNonTransferableNftV1InstructionData
> {
  return mapSerializer<
    RevokeNonTransferableNftV1InstructionDataArgs,
    any,
    RevokeNonTransferableNftV1InstructionData
  >(
    struct<RevokeNonTransferableNftV1InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectIdStr', string()],
        ['nftIdStr', string()],
        ['nftMintBump', u8()],
      ],
      { description: 'RevokeNonTransferableNftV1InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [86, 131, 49, 245, 41, 12, 108, 186],
    })
  ) as Serializer<
    RevokeNonTransferableNftV1InstructionDataArgs,
    RevokeNonTransferableNftV1InstructionData
  >;
}

// Args.
export type RevokeNonTransferableNftV1InstructionArgs = PickPartial<
  RevokeNonTransferableNftV1InstructionDataArgs,
  'nftMintBump'
>;

// Instruction.
export function revokeNonTransferableNftV1(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: RevokeNonTransferableNftV1InstructionAccounts &
    RevokeNonTransferableNftV1InstructionArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'underdogCore',
    'updg8JyjrmFE2h3d71p71zRXDR8q4C6Up8dDoeq3LTM'
  );

  // Resolved inputs.
  const resolvedAccounts = {
    claimer: [input.claimer, false] as const,
  };
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
    'ownerAccount',
    input.ownerAccount
      ? ([input.ownerAccount, false] as const)
      : ([findInitialOwnerPda(context), false] as const)
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
    'nonTransferableProject',
    input.nonTransferableProject
      ? ([input.nonTransferableProject, true] as const)
      : ([
          findProjAccountPda(context, {
            type: 'nt-proj',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
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
    'nonTransferableNftTokenAccount',
    input.nonTransferableNftTokenAccount
      ? ([input.nonTransferableNftTokenAccount, true] as const)
      : ([
          findAssociatedTokenPda(context, {
            mint: publicKey(resolvedAccounts.nonTransferableNftMint[0], false),
            owner: publicKey(resolvedAccounts.nonTransferableProject[0], false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'claimerTokenAccount',
    input.claimerTokenAccount
      ? ([input.claimerTokenAccount, true] as const)
      : ([
          findAssociatedTokenPda(context, {
            mint: publicKey(resolvedAccounts.nonTransferableNftMint[0], false),
            owner: publicKey(input.claimer, false),
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
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.ownerAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.claimer, false);
  addAccountMeta(keys, signers, resolvedAccounts.orgAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.nonTransferableProject, false);
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
    resolvedAccounts.nonTransferableNftTokenAccount,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.claimerTokenAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.associatedTokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);

  // Data.
  const data =
    getRevokeNonTransferableNftV1InstructionDataSerializer().serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
