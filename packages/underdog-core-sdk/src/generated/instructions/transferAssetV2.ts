/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { findTreeConfigPda } from '@metaplex-foundation/mpl-bubblegum';
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
export type TransferAssetV2InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  projectAccount?: PublicKey | Pda;
  leafOwner: PublicKey | Pda;
  newLeafOwner: PublicKey | Pda;
  treeAuthority?: PublicKey | Pda;
  merkleTree: PublicKey | Pda;
  bubblegumSigner?: PublicKey | Pda;
  bubblegumProgram?: PublicKey | Pda;
  logWrapper?: PublicKey | Pda;
  compressionProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type TransferAssetV2InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: bigint;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
  leafIndex: number;
};

export type TransferAssetV2InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: number | bigint;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
  leafIndex: number;
};

/** @deprecated Use `getTransferAssetV2InstructionDataSerializer()` without any argument instead. */
export function getTransferAssetV2InstructionDataSerializer(
  _context: object
): Serializer<
  TransferAssetV2InstructionDataArgs,
  TransferAssetV2InstructionData
>;
export function getTransferAssetV2InstructionDataSerializer(): Serializer<
  TransferAssetV2InstructionDataArgs,
  TransferAssetV2InstructionData
>;
export function getTransferAssetV2InstructionDataSerializer(
  _context: object = {}
): Serializer<
  TransferAssetV2InstructionDataArgs,
  TransferAssetV2InstructionData
> {
  return mapSerializer<
    TransferAssetV2InstructionDataArgs,
    any,
    TransferAssetV2InstructionData
  >(
    struct<TransferAssetV2InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectId', u64()],
        ['root', bytes({ size: 32 })],
        ['dataHash', bytes({ size: 32 })],
        ['creatorHash', bytes({ size: 32 })],
        ['leafIndex', u32()],
      ],
      { description: 'TransferAssetV2InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [71, 6, 143, 170, 93, 206, 94, 240],
    })
  ) as Serializer<
    TransferAssetV2InstructionDataArgs,
    TransferAssetV2InstructionData
  >;
}

// Extra Args.
export type TransferAssetV2InstructionExtraArgs = { proof: Array<PublicKey> };

// Args.
export type TransferAssetV2InstructionArgs = PickPartial<
  TransferAssetV2InstructionDataArgs & TransferAssetV2InstructionExtraArgs,
  'proof'
>;

// Instruction.
export function transferAssetV2(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: TransferAssetV2InstructionAccounts & TransferAssetV2InstructionArgs
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
    leafOwner: [input.leafOwner, false] as const,
    newLeafOwner: [input.newLeafOwner, false] as const,
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
      ? ([input.ownerAccount, true] as const)
      : ([findInitialOwnerPda(context), true] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'orgAccount',
    input.orgAccount
      ? ([input.orgAccount, true] as const)
      : ([
          findOrgAccountPda(context, {
            superAdminAddress: input.superAdminAddress,
            orgId: input.orgId,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'projectAccount',
    input.projectAccount
      ? ([input.projectAccount, true] as const)
      : ([
          findProjectPda(context, {
            prefix: 'project',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectId,
          }),
          true,
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
  addAccountMeta(keys, signers, resolvedAccounts.leafOwner, false);
  addAccountMeta(keys, signers, resolvedAccounts.newLeafOwner, false);
  addAccountMeta(keys, signers, resolvedAccounts.treeAuthority, false);
  addAccountMeta(keys, signers, resolvedAccounts.merkleTree, false);
  addAccountMeta(keys, signers, resolvedAccounts.bubblegumSigner, false);
  addAccountMeta(keys, signers, resolvedAccounts.bubblegumProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.logWrapper, false);
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
    getTransferAssetV2InstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
