import { PublicKey, Umi } from "@metaplex-foundation/umi";
import { findOrgAccountPda } from "./generated";

export type OrgInput = { superAdminAddress: PublicKey; orgId: number };

export const findOrgAddress = (
  context: Umi,
  { superAdminAddress, orgId }: OrgInput
) =>
  findOrgAccountPda(context, { superAdminAddress, orgId: orgId.toString() })[0];
