import { fetchAllTokenByOwnerAndMint } from "@metaplex-foundation/mpl-toolbox";
import {
  createBigInt,
  generateSigner,
  sol,
} from "@metaplex-foundation/umi";

import {
  burnNonTransferableNft,
  claimNonTransferableNft,
  fetchClaimAccountFromSeeds,
  fetchLegacyProjectFromSeeds,
  findLegacyProjectPda,
  findOrgAccountPda,
  initializeLegacyProject,
  initializeOrg,
  mintNonTransferableNft,
  revokeNonTransferableNft,
} from "../../../src/generated";
import { createContext } from "../../setup";
import { findLegacyNftPda } from "../../../src";
import { fetchMetadataFromSeeds } from "@metaplex-foundation/mpl-token-metadata";

describe("Non-Transferable Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();
  const nftId = 1;
  const nftIdStr = nftId.toString();
  const orgControlSigner = generateSigner(context);
  const orgControlAddress = orgControlSigner.publicKey;

  const claimerSigner = generateSigner(context);
  const claimerAddress = claimerSigner.publicKey;

  const name = "Non-Transferable NFT";
  const symbol = "NTNFT";
  const uri = "https://example.com";

  beforeAll(async () => {
    await initializeOrg(context, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(context);

    await context.rpc.airdrop(orgControlAddress, sol(1));
    await context.rpc.airdrop(claimerAddress, sol(1));
  });

  it("creates a non-transferable project", async () => {
    await initializeLegacyProject(context, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      name,
      symbol,
      uri,
      projectType: "n",
    }).sendAndConfirm(context);

    const nonTransferableProject = await fetchLegacyProjectFromSeeds(context, {
      orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
      projectId: projectIdStr,
      type: "nt-proj",
    });

    expect(nonTransferableProject.projectId).toEqual(createBigInt(projectId));
  });

  it("mints a non-transferable nft", async () => {
    await mintNonTransferableNft(context, {
      authority: orgControlSigner,
      superAdminAddress,
      orgId,
      claimerAddress,
      projectIdStr,
      nftIdStr,
      name,
      symbol,
      uri,
    }).sendAndConfirm(context);

    const claimAccount = await fetchClaimAccountFromSeeds(context, {
      orgAccount: findOrgAccountPda(context, {
        superAdminAddress,
        orgId,
      })[0],
      projectId: projectIdStr,
      nftId: nftIdStr,
    });

    expect(claimAccount.claimer).toEqual(claimerAddress);
  });

  const nftMintAddress = findLegacyNftPda(context, {
    prefix: "nt-nft-mint",
    orgAccount: findOrgAccountPda(context, {
      superAdminAddress,
      orgId,
    })[0],
    projectId: projectIdStr,
    nftId: nftIdStr,
  })[0];

  it("claims a non-transferable nft", async () => {
    await claimNonTransferableNft(context, {
      authority: orgControlSigner,
      claimer: claimerSigner,
      superAdminAddress,
      orgId,
      projectIdStr,
      nftIdStr,
    }).sendAndConfirm(context);

    const tokens = await fetchAllTokenByOwnerAndMint(
      context,
      claimerAddress,
      nftMintAddress
    );
    expect(tokens.length).toEqual(1);

    const metadata = await fetchMetadataFromSeeds(context, { mint: nftMintAddress });

    expect(metadata.creators.__option).toBe("Some");
  });

  it("revokes a non-transferable nft", async () => {
    await revokeNonTransferableNft(context, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      claimer: claimerSigner.publicKey,
      orgId,
      projectIdStr,
      nftIdStr,
    }).sendAndConfirm(context);

    const tokens = await fetchAllTokenByOwnerAndMint(
      context,
      claimerAddress,
      nftMintAddress
    );

    expect(tokens.length).toEqual(0);
  });

  it("burns a non-transferable nft", async () => {
    const tokensBeforeBurn = await fetchAllTokenByOwnerAndMint(
      context,
      findLegacyProjectPda(context, {
        type: "nt-proj",
        orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
        projectId: projectIdStr,
      })[0],
      nftMintAddress
    );

    expect(tokensBeforeBurn.length).toEqual(1);

    await burnNonTransferableNft(context, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      nftIdStr,
    }).sendAndConfirm(context);

    const tokensAfterBurn = await fetchAllTokenByOwnerAndMint(
      context,
      findLegacyProjectPda(context, {
        type: "nt-proj",
        orgAccount: findOrgAccountPda(context, { superAdminAddress, orgId })[0],
        projectId: projectIdStr,
      })[0],
      nftMintAddress
    );

    expect(tokensAfterBurn.length).toEqual(0);
  });
});
