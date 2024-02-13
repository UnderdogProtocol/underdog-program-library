/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

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
import { PickPartial, addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type MintTransferableNftV1InstructionAccounts = {
  authority?: Signer;
  ownerAccount: PublicKey | Pda;
  orgAccount: PublicKey | Pda;
  transferableProject: PublicKey | Pda;
  transferableProjectMint: Pda;
  transferableProjectMetadata: PublicKey | Pda;
  transferableProjectMasterEdition: PublicKey | Pda;
  transferableNftMint: PublicKey | Pda;
  transferableNftMetadata: PublicKey | Pda;
  transferableNftMasterEdition: PublicKey | Pda;
  receiver: PublicKey | Pda;
  receiverTokenAccount?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  associatedTokenProgram: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type MintTransferableNftV1InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  projectMintBump: number;
  name: string;
  symbol: string;
  uri: string;
};

export type MintTransferableNftV1InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  projectMintBump: number;
  name: string;
  symbol: string;
  uri: string;
};

/** @deprecated Use `getMintTransferableNftV1InstructionDataSerializer()` without any argument instead. */
export function getMintTransferableNftV1InstructionDataSerializer(
  _context: object
): Serializer<
  MintTransferableNftV1InstructionDataArgs,
  MintTransferableNftV1InstructionData
>;
export function getMintTransferableNftV1InstructionDataSerializer(): Serializer<
  MintTransferableNftV1InstructionDataArgs,
  MintTransferableNftV1InstructionData
>;
export function getMintTransferableNftV1InstructionDataSerializer(
  _context: object = {}
): Serializer<
  MintTransferableNftV1InstructionDataArgs,
  MintTransferableNftV1InstructionData
> {
  return mapSerializer<
    MintTransferableNftV1InstructionDataArgs,
    any,
    MintTransferableNftV1InstructionData
  >(
    struct<MintTransferableNftV1InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectIdStr', string()],
        ['nftIdStr', string()],
        ['projectMintBump', u8()],
        ['name', string()],
        ['symbol', string()],
        ['uri', string()],
      ],
      { description: 'MintTransferableNftV1InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [71, 210, 151, 156, 133, 108, 176, 100],
    })
  ) as Serializer<
    MintTransferableNftV1InstructionDataArgs,
    MintTransferableNftV1InstructionData
  >;
}

// Args.
export type MintTransferableNftV1InstructionArgs = PickPartial<
  MintTransferableNftV1InstructionDataArgs,
  'projectMintBump'
>;

// Instruction.
export function mintTransferableNftV1(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity'>,
  input: MintTransferableNftV1InstructionAccounts &
    MintTransferableNftV1InstructionArgs
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
    ownerAccount: [input.ownerAccount, false] as const,
    orgAccount: [input.orgAccount, false] as const,
    transferableProject: [input.transferableProject, false] as const,
    transferableProjectMint: [input.transferableProjectMint, false] as const,
    transferableProjectMetadata: [
      input.transferableProjectMetadata,
      true,
    ] as const,
    transferableProjectMasterEdition: [
      input.transferableProjectMasterEdition,
      false,
    ] as const,
    transferableNftMint: [input.transferableNftMint, true] as const,
    transferableNftMetadata: [input.transferableNftMetadata, true] as const,
    transferableNftMasterEdition: [
      input.transferableNftMasterEdition,
      true,
    ] as const,
    receiver: [input.receiver, false] as const,
    associatedTokenProgram: [input.associatedTokenProgram, false] as const,
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
    'receiverTokenAccount',
    input.receiverTokenAccount
      ? ([input.receiverTokenAccount, true] as const)
      : ([
          findAssociatedTokenPda(context, {
            mint: publicKey(input.transferableNftMint, false),
            owner: publicKey(input.receiver, false),
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
  addObjectProperty(
    resolvingArgs,
    'projectMintBump',
    input.projectMintBump ?? input.transferableProjectMint[1]
  );
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.ownerAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.orgAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.transferableProject, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.transferableProjectMint,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.transferableProjectMetadata,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.transferableProjectMasterEdition,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.transferableNftMint, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.transferableNftMetadata,
    false
  );
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.transferableNftMasterEdition,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.receiver, false);
  addAccountMeta(keys, signers, resolvedAccounts.receiverTokenAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.associatedTokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);

  // Data.
  const data =
    getMintTransferableNftV1InstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
