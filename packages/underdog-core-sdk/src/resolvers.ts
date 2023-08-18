import { Context, PublicKey } from "@metaplex-foundation/umi";

const stuff: Record<string, Record<string, string>> = {
  t: {
    project: "t-proj",
    projectMint: "t-project-mint",
    projectVault: "t-project-mint-vault",
    nftMint: "t-nft-mint",
  },
  n: {
    project: "nt-proj",
    projectMint: "nt-project-mint",
    projectVault: "nt-project-mint-vault",
    nftMint: "nt-nft-mint",
  },
  c: {
    project: "c-proj",
  },
};

export const resolveProjectPrefix = (
  context: Pick<Context, "eddsa" | "programs">,
  accounts: {},
  args: { projectType: string },
  programId: PublicKey,
  isWritable: boolean
) => stuff[args.projectType].project;

export const resolveProjectMintPrefix = (
  context: Pick<Context, 'eddsa' | 'programs'>,
  accounts: {},
  args: { projectType: string },
  programId: PublicKey,
  isWritable: boolean
) => stuff[args.projectType].projectMint;

export const resolveProjectVaultPrefix = (
  context: Pick<Context, 'eddsa' | 'programs'>,
  accounts: {},
  args: { projectType: string },
  programId: PublicKey,
  isWritable: boolean
) => stuff[args.projectType].projectVault;

export const resolveNftMintPrefix = (
  context: Pick<Context, 'eddsa' | 'programs'>,
  accounts: {},
  args: { projectType: string },
  programId: PublicKey,
  isWritable: boolean
) => stuff[args.projectType].nftMint;
