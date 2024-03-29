/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Option, OptionOrNullable } from '@metaplex-foundation/umi';
import {
  Serializer,
  option,
  string,
  struct,
  u16,
} from '@metaplex-foundation/umi/serializers';

export type UpdatedMetadata = {
  name: Option<string>;
  symbol: Option<string>;
  uri: Option<string>;
  sellerFeeBasisPoints: Option<number>;
};

export type UpdatedMetadataArgs = {
  name: OptionOrNullable<string>;
  symbol: OptionOrNullable<string>;
  uri: OptionOrNullable<string>;
  sellerFeeBasisPoints: OptionOrNullable<number>;
};

/** @deprecated Use `getUpdatedMetadataSerializer()` without any argument instead. */
export function getUpdatedMetadataSerializer(
  _context: object
): Serializer<UpdatedMetadataArgs, UpdatedMetadata>;
export function getUpdatedMetadataSerializer(): Serializer<
  UpdatedMetadataArgs,
  UpdatedMetadata
>;
export function getUpdatedMetadataSerializer(
  _context: object = {}
): Serializer<UpdatedMetadataArgs, UpdatedMetadata> {
  return struct<UpdatedMetadata>(
    [
      ['name', option(string())],
      ['symbol', option(string())],
      ['uri', option(string())],
      ['sellerFeeBasisPoints', option(u16())],
    ],
    { description: 'UpdatedMetadata' }
  ) as Serializer<UpdatedMetadataArgs, UpdatedMetadata>;
}
