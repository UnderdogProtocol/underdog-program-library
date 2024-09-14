import { Umi } from "@metaplex-foundation/umi";
import { findProjectPda } from "./generated";
import { OrgInput, findOrgAddress } from "./orgs";
import { PROJECT_MINT_PREFIX, PROJECT_PREFIX } from "./constants";
import {
  findMasterEditionPda,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import { findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";

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

export const findProjectAddresses = (
  context: Umi,
  projectInput: ProjectInput
) => ({
  orgAddress: findOrgAddress(context, projectInput),
  projectAddress: findProjectAddress(context, projectInput),
  projectMintAddress: findProjectMintAddress(context, projectInput),
  // projectMetadataAddress: findMetadataPda(context, {
  //   mint: findProjectMintAddress(context, projectInput),
  // })[0],
  // projectMasterEditionAddress: findMasterEditionPda(context, {
  //   mint: findProjectMintAddress(context, projectInput),
  // })[0],
  // projectVault: findAssociatedTokenPda(context, {
  //   mint: findProjectMintAddress(context, projectInput),
  //   owner: findProjectAddress(context, projectInput),
  // }),
});

export const getProjectCreators = (
  context: Umi,
  projectInput: ProjectInput
) => {
  const { orgAddress, projectAddress } = findProjectAddresses(
    context,
    projectInput
  );

  return [
    {
      address: projectAddress,
      verified: true,
      share: 100,
    },
    {
      address: orgAddress,
      verified: true,
      share: 0,
    },
  ];
};
