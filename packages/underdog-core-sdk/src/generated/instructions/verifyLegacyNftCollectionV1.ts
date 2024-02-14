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
import { findLegacyNftPda } from '../../pdas';
import {
  resolveNftMintPrefix,
  resolveProjectMintPrefix,
  resolveProjectPrefix,
} from '../../resolvers';
import {
  findInitialOwnerPda,
  findLegacyProjectPda,
  findOrgAccountPda,
} from '../accounts';
import { PickPartial, addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type VerifyLegacyNftCollectionV1InstructionAccounts = {
  authority?: Signer;
  ownerAccount?: PublicKey | Pda;
  orgAccount?: PublicKey | Pda;
  legacyProject?: PublicKey | Pda;
  legacyProjectMint?: Pda;
  legacyProjectMetadata?: PublicKey | Pda;
  legacyProjectMasterEdition?: PublicKey | Pda;
  legacyNftMint?: Pda;
  legacyNftMetadata?: PublicKey | Pda;
  tokenMetadataProgram?: PublicKey | Pda;
  associatedTokenProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type VerifyLegacyNftCollectionV1InstructionData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  projectType: string;
  projectPrefix: string;
  projectMintPrefix: string;
  nftMintPrefix: string;
  projectMintBump: number;
  nftMintBump: number;
};

export type VerifyLegacyNftCollectionV1InstructionDataArgs = {
  superAdminAddress: PublicKey;
  orgId: string;
  projectIdStr: string;
  nftIdStr: string;
  projectType: string;
  projectPrefix: string;
  projectMintPrefix: string;
  nftMintPrefix: string;
  projectMintBump: number;
  nftMintBump: number;
};

/** @deprecated Use `getVerifyLegacyNftCollectionV1InstructionDataSerializer()` without any argument instead. */
export function getVerifyLegacyNftCollectionV1InstructionDataSerializer(
  _context: object
): Serializer<
  VerifyLegacyNftCollectionV1InstructionDataArgs,
  VerifyLegacyNftCollectionV1InstructionData
>;
export function getVerifyLegacyNftCollectionV1InstructionDataSerializer(): Serializer<
  VerifyLegacyNftCollectionV1InstructionDataArgs,
  VerifyLegacyNftCollectionV1InstructionData
>;
export function getVerifyLegacyNftCollectionV1InstructionDataSerializer(
  _context: object = {}
): Serializer<
  VerifyLegacyNftCollectionV1InstructionDataArgs,
  VerifyLegacyNftCollectionV1InstructionData
> {
  return mapSerializer<
    VerifyLegacyNftCollectionV1InstructionDataArgs,
    any,
    VerifyLegacyNftCollectionV1InstructionData
  >(
    struct<VerifyLegacyNftCollectionV1InstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgId', string()],
        ['projectIdStr', string()],
        ['nftIdStr', string()],
        ['projectType', string()],
        ['projectPrefix', string()],
        ['projectMintPrefix', string()],
        ['nftMintPrefix', string()],
        ['projectMintBump', u8()],
        ['nftMintBump', u8()],
      ],
      { description: 'VerifyLegacyNftCollectionV1InstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [119, 220, 244, 5, 4, 131, 166, 232],
    })
  ) as Serializer<
    VerifyLegacyNftCollectionV1InstructionDataArgs,
    VerifyLegacyNftCollectionV1InstructionData
  >;
}

// Args.
export type VerifyLegacyNftCollectionV1InstructionArgs = PickPartial<
  VerifyLegacyNftCollectionV1InstructionDataArgs,
  | 'projectPrefix'
  | 'projectMintPrefix'
  | 'nftMintPrefix'
  | 'projectMintBump'
  | 'nftMintBump'
>;

// Instruction.
export function verifyLegacyNftCollectionV1(
  context: Pick<Context, 'programs' | 'eddsa' | 'identity' | 'payer'>,
  input: VerifyLegacyNftCollectionV1InstructionAccounts &
    VerifyLegacyNftCollectionV1InstructionArgs
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
    resolvingArgs,
    'projectPrefix',
    input.projectPrefix ??
      resolveProjectPrefix(
        context,
        { ...input, ...resolvedAccounts },
        { ...input, ...resolvingArgs },
        programId,
        false
      )
  );
  addObjectProperty(
    resolvedAccounts,
    'legacyProject',
    input.legacyProject
      ? ([input.legacyProject, true] as const)
      : ([
          findLegacyProjectPda(context, {
            type: resolvingArgs.projectPrefix,
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvingArgs,
    'projectMintPrefix',
    input.projectMintPrefix ??
      resolveProjectMintPrefix(
        context,
        { ...input, ...resolvedAccounts },
        { ...input, ...resolvingArgs },
        programId,
        false
      )
  );
  addObjectProperty(
    resolvedAccounts,
    'legacyProjectMint',
    input.legacyProjectMint
      ? ([input.legacyProjectMint, false] as const)
      : ([
          findLegacyProjectPda(context, {
            type: resolvingArgs.projectMintPrefix,
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'legacyProjectMetadata',
    input.legacyProjectMetadata
      ? ([input.legacyProjectMetadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(resolvedAccounts.legacyProjectMint[0], false),
          }),
          true,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'legacyProjectMasterEdition',
    input.legacyProjectMasterEdition
      ? ([input.legacyProjectMasterEdition, false] as const)
      : ([
          findMasterEditionPda(context, {
            mint: publicKey(resolvedAccounts.legacyProjectMint[0], false),
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvingArgs,
    'nftMintPrefix',
    input.nftMintPrefix ??
      resolveNftMintPrefix(
        context,
        { ...input, ...resolvedAccounts },
        { ...input, ...resolvingArgs },
        programId,
        false
      )
  );
  addObjectProperty(
    resolvedAccounts,
    'legacyNftMint',
    input.legacyNftMint
      ? ([input.legacyNftMint, false] as const)
      : ([
          findLegacyNftPda(context, {
            prefix: resolvingArgs.nftMintPrefix,
            orgAccount: publicKey(resolvedAccounts.orgAccount[0], false),
            projectId: input.projectIdStr,
            nftId: input.nftIdStr,
          }),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'legacyNftMetadata',
    input.legacyNftMetadata
      ? ([input.legacyNftMetadata, true] as const)
      : ([
          findMetadataPda(context, {
            mint: publicKey(resolvedAccounts.legacyNftMint[0], false),
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
    input.projectMintBump ?? resolvedAccounts.legacyProjectMint[0][1]
  );
  addObjectProperty(
    resolvingArgs,
    'nftMintBump',
    input.nftMintBump ?? resolvedAccounts.legacyNftMint[0][1]
  );
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.ownerAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.orgAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.legacyProject, false);
  addAccountMeta(keys, signers, resolvedAccounts.legacyProjectMint, false);
  addAccountMeta(keys, signers, resolvedAccounts.legacyProjectMetadata, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.legacyProjectMasterEdition,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.legacyNftMint, false);
  addAccountMeta(keys, signers, resolvedAccounts.legacyNftMetadata, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenMetadataProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.associatedTokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);

  // Data.
  const data =
    getVerifyLegacyNftCollectionV1InstructionDataSerializer().serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
