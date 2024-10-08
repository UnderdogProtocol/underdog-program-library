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
  mapSerializer,
  struct,
  u32,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type InitializeTreeInstructionAccounts = {
  authority?: Signer;
  treeAuthority?: PublicKey | Pda;
  merkleTree: Signer;
  logWrapper?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  bubblegumProgram?: PublicKey | Pda;
  compressionProgram?: PublicKey | Pda;
};

// Data.
export type InitializeTreeInstructionData = {
  discriminator: Array<number>;
  maxDepth: number;
  maxBufferSize: number;
};

export type InitializeTreeInstructionDataArgs = {
  maxDepth: number;
  maxBufferSize: number;
};

/** @deprecated Use `getInitializeTreeInstructionDataSerializer()` without any argument instead. */
export function getInitializeTreeInstructionDataSerializer(
  _context: object
): Serializer<InitializeTreeInstructionDataArgs, InitializeTreeInstructionData>;
export function getInitializeTreeInstructionDataSerializer(): Serializer<
  InitializeTreeInstructionDataArgs,
  InitializeTreeInstructionData
>;
export function getInitializeTreeInstructionDataSerializer(
  _context: object = {}
): Serializer<
  InitializeTreeInstructionDataArgs,
  InitializeTreeInstructionData
> {
  return mapSerializer<
    InitializeTreeInstructionDataArgs,
    any,
    InitializeTreeInstructionData
  >(
    struct<InitializeTreeInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['maxDepth', u32()],
        ['maxBufferSize', u32()],
      ],
      { description: 'InitializeTreeInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [211, 231, 181, 174, 40, 77, 227, 51],
    })
  ) as Serializer<
    InitializeTreeInstructionDataArgs,
    InitializeTreeInstructionData
  >;
}

// Args.
export type InitializeTreeInstructionArgs = InitializeTreeInstructionDataArgs;

// Instruction.
export function initializeTree(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: InitializeTreeInstructionAccounts & InitializeTreeInstructionArgs
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
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.treeAuthority, false);
  addAccountMeta(keys, signers, resolvedAccounts.merkleTree, false);
  addAccountMeta(keys, signers, resolvedAccounts.logWrapper, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.bubblegumProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.compressionProgram, false);

  // Data.
  const data =
    getInitializeTreeInstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
