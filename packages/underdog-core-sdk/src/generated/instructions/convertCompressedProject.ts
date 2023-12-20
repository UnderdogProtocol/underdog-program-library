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
import {
  findInitialOwnerPda,
  findLegacyProjectPda,
  findOrgAccountPda,
  findProjectPda,
} from '../accounts';
import { addAccountMeta, addObjectProperty } from '../shared';
import {
  UpdateMetadataArgs,
  UpdateMetadataArgsArgs,
  getUpdateMetadataArgsSerializer,
} from '../types';

// Accounts.
export type ConvertCompressedProjectInstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  compressedProject?: PublicKey | Pda;
  projectAccount?: PublicKey | Pda;
  compressedProjectMint?: PublicKey | Pda;
  projectVault?: PublicKey | Pda;
  compressedProjectVault?: PublicKey | Pda;
  compressedProjectMetadata?: PublicKey | Pda;
  compressedProjectMasterEdition?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type ConvertCompressedProjectInstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  projectId: bigint;
  metadata: UpdateMetadataArgs;
};

export type ConvertCompressedProjectInstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  projectId: number | bigint;
  metadata: UpdateMetadataArgsArgs;
};

/** @deprecated Use `getConvertCompressedProjectInstructionDataSerializer()` without any argument instead. */
export function getConvertCompressedProjectInstructionDataSerializer(
  _context: object
): Serializer<
  ConvertCompressedProjectInstructionDataArgs,
  ConvertCompressedProjectInstructionData
>;
export function getConvertCompressedProjectInstructionDataSerializer(): Serializer<
  ConvertCompressedProjectInstructionDataArgs,
  ConvertCompressedProjectInstructionData
>;
export function getConvertCompressedProjectInstructionDataSerializer(
  _context: object = {}
): Serializer<
  ConvertCompressedProjectInstructionDataArgs,
  ConvertCompressedProjectInstructionData
> {
  return mapSerializer<
    ConvertCompressedProjectInstructionDataArgs,
    any,
    ConvertCompressedProjectInstructionData
  >(
    struct<ConvertCompressedProjectInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectIdStr', string()],
        ['projectId', u64()],
        ['metadata', getUpdateMetadataArgsSerializer()],
      ],
      { description: 'ConvertCompressedProjectInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [138, 215, 99, 5, 110, 189, 230, 194],
    })
  ) as Serializer<
    ConvertCompressedProjectInstructionDataArgs,
    ConvertCompressedProjectInstructionData
  >;
}

// Args.
export type ConvertCompressedProjectInstructionArgs =
  ConvertCompressedProjectInstructionDataArgs;

// Instruction.
export function convertCompressedProject(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: ConvertCompressedProjectInstructionAccounts &
    ConvertCompressedProjectInstructionArgs
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
    'compressedProjectMint',
    input.compressedProjectMint
      ? ([input.compressedProjectMint, false] as const)
      : ([
          findLegacyProjectPda(context, {
            type: 'c-project-mint',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'projectVault',
    input.projectVault
      ? ([input.projectVault, true] as const)
      : ([
          findProjectPda(context, {
            prefix: 'project-vault',
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectId,
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
  addAccountMeta(keys, signers, resolvedAccounts.projectAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.compressedProjectMint, false);
  addAccountMeta(keys, signers, resolvedAccounts.projectVault, false);
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
    getConvertCompressedProjectInstructionDataSerializer().serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}