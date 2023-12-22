/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  AccountMeta,
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
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
  u8,
} from '@metaplex-foundation/umi/serializers';
import { findInitialOwnerPda, findOrgAccountPda } from '../accounts';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type InscribeImageV0InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  inscriptionAccount: Signer;
  inscriptionMetadataAccount?: PublicKey | Pda;
  inscriptionShardAccount: PublicKey | Pda;
  inscriptionProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type InscribeImageV0InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  value: Uint8Array;
};

export type InscribeImageV0InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  value: Uint8Array;
};

/** @deprecated Use `getInscribeImageV0InstructionDataSerializer()` without any argument instead. */
export function getInscribeImageV0InstructionDataSerializer(
  _context: object
): Serializer<
  InscribeImageV0InstructionDataArgs,
  InscribeImageV0InstructionData
>;
export function getInscribeImageV0InstructionDataSerializer(): Serializer<
  InscribeImageV0InstructionDataArgs,
  InscribeImageV0InstructionData
>;
export function getInscribeImageV0InstructionDataSerializer(
  _context: object = {}
): Serializer<
  InscribeImageV0InstructionDataArgs,
  InscribeImageV0InstructionData
> {
  return mapSerializer<
    InscribeImageV0InstructionDataArgs,
    any,
    InscribeImageV0InstructionData
  >(
    struct<InscribeImageV0InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['value', bytes({ size: u32() })],
      ],
      { description: 'InscribeImageV0InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [181, 77, 248, 45, 110, 136, 203, 60],
    })
  ) as Serializer<
    InscribeImageV0InstructionDataArgs,
    InscribeImageV0InstructionData
  >;
}

// Args.
export type InscribeImageV0InstructionArgs = InscribeImageV0InstructionDataArgs;

// Instruction.
export function inscribeImageV0(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: InscribeImageV0InstructionAccounts & InscribeImageV0InstructionArgs
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
    inscriptionAccount: [input.inscriptionAccount, true] as const,
    inscriptionShardAccount: [input.inscriptionShardAccount, true] as const,
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
    'inscriptionMetadataAccount',
    input.inscriptionMetadataAccount
      ? ([input.inscriptionMetadataAccount, true] as const)
      : ([programId /* Unrecognized default kind []. */, false] as const)
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
  addAccountMeta(keys, signers, resolvedAccounts.inscriptionAccount, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.inscriptionMetadataAccount,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.inscriptionShardAccount,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.inscriptionProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);

  // Data.
  const data =
    getInscribeImageV0InstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}