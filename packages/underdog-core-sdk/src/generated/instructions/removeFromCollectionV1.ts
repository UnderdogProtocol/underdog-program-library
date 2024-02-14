/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { findTreeConfigPda } from '@metaplex-foundation/mpl-bubblegum';
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
  bool,
  bytes,
  mapSerializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u32,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  findInitialOwnerPda,
  findOrgAccountPda,
  findProjectPda,
} from '../accounts';
import { PickPartial, addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type RemoveFromCollectionV1InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  projectAccount?: PublicKey | Pda;
  collectionMint: PublicKey | Pda;
  collectionMetadata?: PublicKey | Pda;
  collectionMasterEdition?: PublicKey | Pda;
  recipient: PublicKey | Pda;
  treeAuthority?: PublicKey | Pda;
  merkleTree: PublicKey | Pda;
  bubblegumSigner?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  logWrapper?: PublicKey | Pda;
  bubblegumProgram?: PublicKey | Pda;
  compressionProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type RemoveFromCollectionV1InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: bigint;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
  leafIndex: number;
  name: string;
  symbol: string;
  uri: string;
  isDelegated: boolean;
};

export type RemoveFromCollectionV1InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: number | bigint;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
  leafIndex: number;
  name: string;
  symbol: string;
  uri: string;
  isDelegated: boolean;
};

/** @deprecated Use `getRemoveFromCollectionV1InstructionDataSerializer()` without any argument instead. */
export function getRemoveFromCollectionV1InstructionDataSerializer(
  _context: object
): Serializer<
  RemoveFromCollectionV1InstructionDataArgs,
  RemoveFromCollectionV1InstructionData
>;
export function getRemoveFromCollectionV1InstructionDataSerializer(): Serializer<
  RemoveFromCollectionV1InstructionDataArgs,
  RemoveFromCollectionV1InstructionData
>;
export function getRemoveFromCollectionV1InstructionDataSerializer(
  _context: object = {}
): Serializer<
  RemoveFromCollectionV1InstructionDataArgs,
  RemoveFromCollectionV1InstructionData
> {
  return mapSerializer<
    RemoveFromCollectionV1InstructionDataArgs,
    any,
    RemoveFromCollectionV1InstructionData
  >(
    struct<RemoveFromCollectionV1InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectId', u64()],
        ['root', bytes({ size: 32 })],
        ['dataHash', bytes({ size: 32 })],
        ['creatorHash', bytes({ size: 32 })],
        ['leafIndex', u32()],
        ['name', string()],
        ['symbol', string()],
        ['uri', string()],
        ['isDelegated', bool()],
      ],
      { description: 'RemoveFromCollectionV1InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [169, 159, 126, 224, 75, 109, 103, 222],
    })
  ) as Serializer<
    RemoveFromCollectionV1InstructionDataArgs,
    RemoveFromCollectionV1InstructionData
  >;
}

// Extra Args.
export type RemoveFromCollectionV1InstructionExtraArgs = {
  proof: Array<PublicKey>;
};

// Args.
export type RemoveFromCollectionV1InstructionArgs = PickPartial<
  RemoveFromCollectionV1InstructionDataArgs &
    RemoveFromCollectionV1InstructionExtraArgs,
  'proof'
>;

// Instruction.
export function removeFromCollectionV1(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: RemoveFromCollectionV1InstructionAccounts &
    RemoveFromCollectionV1InstructionArgs
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
    collectionMint: [input.collectionMint, true] as const,
    recipient: [input.recipient, false] as const,
    merkleTree: [input.merkleTree, true] as const,
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
    'treeAuthority',
    input.treeAuthority
      ? ([input.treeAuthority, true] as const)
      : ([
          findTreeConfigPda(context, {
            merkleTree: publicKey(input.merkleTree, false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'bubblegumSigner',
    input.bubblegumSigner
      ? ([input.bubblegumSigner, false] as const)
      : ([
          publicKey('4ewWZC5gT6TGpm5LZNDs9wVonfUT2q5PP5sc9kVbwMAK'),
          false,
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
    'logWrapper',
    input.logWrapper
      ? ([input.logWrapper, false] as const)
      : ([
          context.programs.getPublicKey(
            'splNoop',
            'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV'
          ),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'bubblegumProgram',
    input.bubblegumProgram
      ? ([input.bubblegumProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'bubblegumProgram',
            'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'
          ),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'compressionProgram',
    input.compressionProgram
      ? ([input.compressionProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splAccountCompression',
            'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK'
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
  addObjectProperty(resolvingArgs, 'proof', input.proof ?? []);
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
  addAccountMeta(keys, signers, resolvedAccounts.recipient, false);
  addAccountMeta(keys, signers, resolvedAccounts.treeAuthority, false);
  addAccountMeta(keys, signers, resolvedAccounts.merkleTree, false);
  addAccountMeta(keys, signers, resolvedAccounts.bubblegumSigner, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.logWrapper, false);
  addAccountMeta(keys, signers, resolvedAccounts.bubblegumProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.compressionProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);

  // Remaining Accounts.
  const remainingAccounts = resolvedArgs.proof.map(
    (address) => [address, false] as const
  );
  remainingAccounts.forEach((remainingAccount) =>
    addAccountMeta(keys, signers, remainingAccount, false)
  );

  // Data.
  const data =
    getRemoveFromCollectionV1InstructionDataSerializer().serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
