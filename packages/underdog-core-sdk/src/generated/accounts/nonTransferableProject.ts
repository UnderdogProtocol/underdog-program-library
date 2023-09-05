/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  mapSerializer,
  publicKey as publicKeySerializer,
  struct,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';

export type NonTransferableProject = Account<NonTransferableProjectAccountData>;

export type NonTransferableProjectAccountData = {
  discriminator: Array<number>;
  superAdminAddress: PublicKey;
  orgAddress: PublicKey;
  projectId: bigint;
  bump: number;
};

export type NonTransferableProjectAccountDataArgs = {
  superAdminAddress: PublicKey;
  orgAddress: PublicKey;
  projectId: number | bigint;
  bump: number;
};

/** @deprecated Use `getNonTransferableProjectAccountDataSerializer()` without any argument instead. */
export function getNonTransferableProjectAccountDataSerializer(
  _context: object
): Serializer<
  NonTransferableProjectAccountDataArgs,
  NonTransferableProjectAccountData
>;
export function getNonTransferableProjectAccountDataSerializer(): Serializer<
  NonTransferableProjectAccountDataArgs,
  NonTransferableProjectAccountData
>;
export function getNonTransferableProjectAccountDataSerializer(
  _context: object = {}
): Serializer<
  NonTransferableProjectAccountDataArgs,
  NonTransferableProjectAccountData
> {
  return mapSerializer<
    NonTransferableProjectAccountDataArgs,
    any,
    NonTransferableProjectAccountData
  >(
    struct<NonTransferableProjectAccountData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['superAdminAddress', publicKeySerializer()],
        ['orgAddress', publicKeySerializer()],
        ['projectId', u64()],
        ['bump', u8()],
      ],
      { description: 'NonTransferableProjectAccountData' }
    ),
    (value) => ({
      ...value,
      discriminator: [103, 8, 66, 155, 49, 224, 143, 42],
    })
  ) as Serializer<
    NonTransferableProjectAccountDataArgs,
    NonTransferableProjectAccountData
  >;
}

/** @deprecated Use `deserializeNonTransferableProject(rawAccount)` without any context instead. */
export function deserializeNonTransferableProject(
  context: object,
  rawAccount: RpcAccount
): NonTransferableProject;
export function deserializeNonTransferableProject(
  rawAccount: RpcAccount
): NonTransferableProject;
export function deserializeNonTransferableProject(
  context: RpcAccount | object,
  rawAccount?: RpcAccount
): NonTransferableProject {
  return deserializeAccount(
    rawAccount ?? (context as RpcAccount),
    getNonTransferableProjectAccountDataSerializer()
  );
}

export async function fetchNonTransferableProject(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<NonTransferableProject> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'NonTransferableProject');
  return deserializeNonTransferableProject(maybeAccount);
}

export async function safeFetchNonTransferableProject(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<NonTransferableProject | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists
    ? deserializeNonTransferableProject(maybeAccount)
    : null;
}

export async function fetchAllNonTransferableProject(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<NonTransferableProject[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'NonTransferableProject');
    return deserializeNonTransferableProject(maybeAccount);
  });
}

export async function safeFetchAllNonTransferableProject(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<NonTransferableProject[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) =>
      deserializeNonTransferableProject(maybeAccount as RpcAccount)
    );
}

export function getNonTransferableProjectGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'underdogCore',
    'updg8JyjrmFE2h3d71p71zRXDR8q4C6Up8dDoeq3LTM'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      discriminator: Array<number>;
      superAdminAddress: PublicKey;
      orgAddress: PublicKey;
      projectId: number | bigint;
      bump: number;
    }>({
      discriminator: [0, array(u8(), { size: 8 })],
      superAdminAddress: [8, publicKeySerializer()],
      orgAddress: [40, publicKeySerializer()],
      projectId: [72, u64()],
      bump: [80, u8()],
    })
    .deserializeUsing<NonTransferableProject>((account) =>
      deserializeNonTransferableProject(account)
    )
    .whereField('discriminator', [103, 8, 66, 155, 49, 224, 143, 42]);
}

export function getNonTransferableProjectSize(): number {
  return 81;
}
