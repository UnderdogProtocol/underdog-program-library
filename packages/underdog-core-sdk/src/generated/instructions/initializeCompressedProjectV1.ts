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
import {
  findInitialOwnerPda,
  findLegacyProjectPda,
  findOrgAccountPda,
} from '../accounts';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type InitializeCompressedProjectV1InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  compressedProject?: PublicKey | Pda;
  compressedProjectMint?: PublicKey | Pda;
  compressedProjectVault?: PublicKey | Pda;
  compressedProjectMetadata?: PublicKey | Pda;
  compressedProjectMasterEdition?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type InitializeCompressedProjectV1InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  name: string;
  symbol: string;
  uri: string;
};

export type InitializeCompressedProjectV1InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  name: string;
  symbol: string;
  uri: string;
};

/** @deprecated Use `getInitializeCompressedProjectV1InstructionDataSerializer()` without any argument instead. */
export function getInitializeCompressedProjectV1InstructionDataSerializer(
  _context: object
): Serializer<
  InitializeCompressedProjectV1InstructionDataArgs,
  InitializeCompressedProjectV1InstructionData
>;
export function getInitializeCompressedProjectV1InstructionDataSerializer(): Serializer<
  InitializeCompressedProjectV1InstructionDataArgs,
  InitializeCompressedProjectV1InstructionData
>;
export function getInitializeCompressedProjectV1InstructionDataSerializer(
  _context: object = {}
): Serializer<
  InitializeCompressedProjectV1InstructionDataArgs,
  InitializeCompressedProjectV1InstructionData
> {
  return mapSerializer<
    InitializeCompressedProjectV1InstructionDataArgs,
    any,
    InitializeCompressedProjectV1InstructionData
  >(
    struct<InitializeCompressedProjectV1InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectIdStr', string()],
        ['name', string()],
        ['symbol', string()],
        ['uri', string()],
      ],
      { description: 'InitializeCompressedProjectV1InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [214, 50, 74, 217, 68, 216, 35, 187],
    })
  ) as Serializer<
    InitializeCompressedProjectV1InstructionDataArgs,
    InitializeCompressedProjectV1InstructionData
  >;
}

// Args.
export type InitializeCompressedProjectV1InstructionArgs =
  InitializeCompressedProjectV1InstructionDataArgs;

// Instruction.
export function initializeCompressedProjectV1(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: InitializeCompressedProjectV1InstructionAccounts &
    InitializeCompressedProjectV1InstructionArgs
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
      ? ([input.ownerAccount, false] as const)
      : ([findInitialOwnerPda(context), false] as const)
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
    'compressedProject',
    input.compressedProject
      ? ([input.compressedProject, true] as const)
      : ([
          findLegacyProjectPda(context, {
            type: 'c-proj',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'compressedProjectMint',
    input.compressedProjectMint
      ? ([input.compressedProjectMint, true] as const)
      : ([
          findLegacyProjectPda(context, {
            type: 'c-project-mint',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'compressedProjectVault',
    input.compressedProjectVault
      ? ([input.compressedProjectVault, true] as const)
      : ([
          findLegacyProjectPda(context, {
            type: 'c-project-vault',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'compressedProjectMetadata',
    input.compressedProjectMetadata
      ? ([input.compressedProjectMetadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(resolvedAccounts.compressedProjectMint[0], false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'compressedProjectMasterEdition',
    input.compressedProjectMasterEdition
      ? ([input.compressedProjectMasterEdition, true] as const)
      : ([
          findMasterEditionPda(context, {
            mint: publicKey(resolvedAccounts.compressedProjectMint[0], false),
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
  addAccountMeta(keys, signers, resolvedAccounts.compressedProject, false);
  addAccountMeta(keys, signers, resolvedAccounts.compressedProjectMint, false);
  addAccountMeta(keys, signers, resolvedAccounts.compressedProjectVault, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.compressedProjectMetadata,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.compressedProjectMasterEdition,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);

  // Data.
  const data =
    getInitializeCompressedProjectV1InstructionDataSerializer().serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
