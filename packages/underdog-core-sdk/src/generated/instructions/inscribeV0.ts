/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
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
export type InscribeV0InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  projectAccount?: PublicKey | Pda;
  mint?: PublicKey | Pda;
  mintInscriptionAccount: PublicKey | Pda;
  inscriptionShardAccount: PublicKey | Pda;
  inscriptionMetadata: PublicKey | Pda;
  metadata?: PublicKey | Pda;
  inscriptionProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type InscribeV0InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: bigint;
  nftId: bigint;
};

export type InscribeV0InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectId: number | bigint;
  nftId: number | bigint;
};

/** @deprecated Use `getInscribeV0InstructionDataSerializer()` without any argument instead. */
export function getInscribeV0InstructionDataSerializer(
  _context: object
): Serializer<InscribeV0InstructionDataArgs, InscribeV0InstructionData>;
export function getInscribeV0InstructionDataSerializer(): Serializer<
  InscribeV0InstructionDataArgs,
  InscribeV0InstructionData
>;
export function getInscribeV0InstructionDataSerializer(
  _context: object = {}
): Serializer<InscribeV0InstructionDataArgs, InscribeV0InstructionData> {
  return mapSerializer<
    InscribeV0InstructionDataArgs,
    any,
    InscribeV0InstructionData
  >(
    struct<InscribeV0InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectId', u64()],
        ['nftId', u64()],
      ],
      { description: 'InscribeV0InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [239, 48, 241, 97, 106, 71, 35, 228],
    })
  ) as Serializer<InscribeV0InstructionDataArgs, InscribeV0InstructionData>;
}

// Args.
export type InscribeV0InstructionArgs = InscribeV0InstructionDataArgs;

// Instruction.
export function inscribeV0(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: InscribeV0InstructionAccounts & InscribeV0InstructionArgs
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
    mintInscriptionAccount: [input.mintInscriptionAccount, true] as const,
    inscriptionShardAccount: [input.inscriptionShardAccount, true] as const,
    inscriptionMetadata: [input.inscriptionMetadata, true] as const,
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
      ? ([input.metadata, false] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(resolvedAccounts.mint[0], false),
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'inscriptionProgram',
    input.inscriptionProgram
      ? ([input.inscriptionProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'inscriptionProgram',
            '1NSCRfGeyo7wPUazGbaPBUsTM49e1k2aXewHGARfzSo'
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
  addAccountMeta(keys, signers, resolvedAccounts.mint, false);
  addAccountMeta(keys, signers, resolvedAccounts.mintInscriptionAccount, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.inscriptionShardAccount,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.inscriptionMetadata, false);
  addAccountMeta(keys, signers, resolvedAccounts.metadata, false);
  addAccountMeta(keys, signers, resolvedAccounts.inscriptionProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);

  // Data.
  const data = getInscribeV0InstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
