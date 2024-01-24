import { Umi } from "@metaplex-foundation/umi";
import { findProjectPda } from "./generated";
import { OrgInput, findOrgAddress } from "./orgs";
import { PROJECT_MINT_PREFIX, PROJECT_PREFIX } from "./constants";

export type ProjectInput = OrgInput & { projectId: number };

export const findProjectAddressByPrefix = (
  context: Umi,
  { projectId, ...orgInput }: ProjectInput,
  prefix: string
) => {
  const orgAddress = findOrgAddress(context, orgInput);
  return findProjectPda(context, {
    prefix,
    orgAccount: orgAddress,
    projectId,
  })[0];
};

export const findProjectAddress = (context: Umi, projectInput: ProjectInput) =>
  findProjectAddressByPrefix(context, projectInput, PROJECT_PREFIX);

export const findProjectMintAddress = (
  context: Umi,
  projectInput: ProjectInput
) => findProjectAddressByPrefix(context, projectInput, PROJECT_MINT_PREFIX);
