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
  u16,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  findInitialOwnerPda,
  findOrgAccountPda,
  findProjectPda,
} from '../accounts';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type InitializeProjectV1InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  projectAccount?: PublicKey | Pda;
  projectMint?: PublicKey | Pda;
  projectVault?: PublicKey | Pda;
  projectMetadata?: PublicKey | Pda;
  projectMasterEdition?: PublicKey | Pda;
  associatedTokenProgram?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type InitializeProjectV1InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: bigint;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
};

export type InitializeProjectV1InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: number | bigint;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
};

/** @deprecated Use `getInitializeProjectV1InstructionDataSerializer()` without any argument instead. */
export function getInitializeProjectV1InstructionDataSerializer(
  _context: object
): Serializer<
  InitializeProjectV1InstructionDataArgs,
  InitializeProjectV1InstructionData
>;
export function getInitializeProjectV1InstructionDataSerializer(): Serializer<
  InitializeProjectV1InstructionDataArgs,
  InitializeProjectV1InstructionData
>;
export function getInitializeProjectV1InstructionDataSerializer(
  _context: object = {}
): Serializer<
  InitializeProjectV1InstructionDataArgs,
  InitializeProjectV1InstructionData
> {
  return mapSerializer<
    InitializeProjectV1InstructionDataArgs,
    any,
    InitializeProjectV1InstructionData
  >(
    struct<InitializeProjectV1InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectId', u64()],
        ['name', string()],
        ['symbol', string()],
        ['uri', string()],
        ['sellerFeeBasisPoints', u16()],
      ],
      { description: 'InitializeProjectV1InstructionData' }
    ),
    (value) => ({ ...value, discriminator: [2, 106, 9, 67, 176, 35, 216, 232] })
  ) as Serializer<
    InitializeProjectV1InstructionDataArgs,
    InitializeProjectV1InstructionData
  >;
}

// Args.
export type InitializeProjectV1InstructionArgs =
  InitializeProjectV1InstructionDataArgs;

// Instruction.
export function initializeProjectV1(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: InitializeProjectV1InstructionAccounts &
    InitializeProjectV1InstructionArgs
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
    'projectMint',
    input.projectMint
      ? ([input.projectMint, true] as const)
      : ([
          findProjectPda(context, {
            prefix: 'project-mint',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectId,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'projectVault',
    input.projectVault
      ? ([input.projectVault, true] as const)
      : ([
          findAssociatedTokenPda(context, {
            mint: publicKey(resolvedAccounts.projectMint[0], false),
            owner: publicKey(resolvedAccounts.projectAccount[0], false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'projectMetadata',
    input.projectMetadata
      ? ([input.projectMetadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(resolvedAccounts.projectMint[0], false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'projectMasterEdition',
    input.projectMasterEdition
      ? ([input.projectMasterEdition, true] as const)
      : ([
          findMasterEditionPda(context, {
            mint: publicKey(resolvedAccounts.projectMint[0], false),
          }),
          true,
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
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.ownerAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.orgAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.projectAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.projectMint, false);
  addAccountMeta(keys, signers, resolvedAccounts.projectVault, false);
  addAccountMeta(keys, signers, resolvedAccounts.projectMetadata, false);
  addAccountMeta(keys, signers, resolvedAccounts.projectMasterEdition, false);
  addAccountMeta(keys, signers, resolvedAccounts.associatedTokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);

  // Data.
  const data =
    getInitializeProjectV1InstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
