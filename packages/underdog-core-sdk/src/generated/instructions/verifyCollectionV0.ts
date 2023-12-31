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
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { findMintPda } from '../../pdas';
import {
  findInitialOwnerPda,
  findOrgAccountPda,
  findProjectPda,
} from '../accounts';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type VerifyCollectionV0InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  projectAccount?: PublicKey | Pda;
  collectionMint: PublicKey | Pda;
  collectionMetadata?: PublicKey | Pda;
  collectionMasterEdition?: PublicKey | Pda;
  mint?: PublicKey | Pda;
  metadata?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type VerifyCollectionV0InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: bigint;
  nftId: bigint;
};

export type VerifyCollectionV0InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: number | bigint;
  nftId: number | bigint;
};

/** @deprecated Use `getVerifyCollectionV0InstructionDataSerializer()` without any argument instead. */
export function getVerifyCollectionV0InstructionDataSerializer(
  _context: object
): Serializer<
  VerifyCollectionV0InstructionDataArgs,
  VerifyCollectionV0InstructionData
>;
export function getVerifyCollectionV0InstructionDataSerializer(): Serializer<
  VerifyCollectionV0InstructionDataArgs,
  VerifyCollectionV0InstructionData
>;
export function getVerifyCollectionV0InstructionDataSerializer(
  _context: object = {}
): Serializer<
  VerifyCollectionV0InstructionDataArgs,
  VerifyCollectionV0InstructionData
> {
  return mapSerializer<
    VerifyCollectionV0InstructionDataArgs,
    any,
    VerifyCollectionV0InstructionData
  >(
    struct<VerifyCollectionV0InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectId', u64()],
        ['nftId', u64()],
      ],
      { description: 'VerifyCollectionV0InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [136, 176, 77, 140, 69, 117, 148, 132],
    })
  ) as Serializer<
    VerifyCollectionV0InstructionDataArgs,
    VerifyCollectionV0InstructionData
  >;
}

// Args.
export type VerifyCollectionV0InstructionArgs =
  VerifyCollectionV0InstructionDataArgs;

// Instruction.
export function verifyCollectionV0(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: VerifyCollectionV0InstructionAccounts &
    VerifyCollectionV0InstructionArgs
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
    collectionMint: [input.collectionMint, false] as const,
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
    'projectAccount',
    input.projectAccount
      ? ([input.projectAccount, false] as const)
      : ([
          findProjectPda(context, {
            prefix: 'project',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectId,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'collectionMetadata',
    input.collectionMetadata
      ? ([input.collectionMetadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(input.collectionMint, false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'collectionMasterEdition',
    input.collectionMasterEdition
      ? ([input.collectionMasterEdition, false] as const)
      : ([
          findMasterEditionPda(context, {
            mint: publicKey(input.collectionMint, false),
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'mint',
    input.mint
      ? ([input.mint, false] as const)
      : ([
          findMintPda(context, {
            projectAccount: publicKey(
              resolvedAccounts.projectAccount[0],
              false
            ),
            nftId: input.nftId,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'metadata',
    input.metadata
      ? ([input.metadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(resolvedAccounts.mint[0], false),
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
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.ownerAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.orgAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.projectAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.collectionMint, false);
  addAccountMeta(keys, signers, resolvedAccounts.collectionMetadata, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.collectionMasterEdition,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.mint, false);
  addAccountMeta(keys, signers, resolvedAccounts.metadata, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);

  // Data.
  const data =
    getVerifyCollectionV0InstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
