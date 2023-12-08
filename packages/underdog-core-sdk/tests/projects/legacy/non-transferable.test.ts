import { fetchAllTokenByOwnerAndMint } from "@metaplex-foundation/mpl-toolbox";
import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";

import {
  burnNonTransferableNftV1,
  claimNonTransferableNftV1,
  fetchClaimAccountFromSeeds,
  fetchLegacyProjectFromSeeds,
  findLegacyProjectPda,
  findOrgAccountPda,
  initializeLegacyProjectV1,
  initializeOrgV1,
  mintNonTransferableNftV1,
  revokeNonTransferableNftV1,
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

  const claimerSigner = generateSigner(context);
  const claimerAddress = claimerSigner.publicKey;

  const name = "Non-Transferable NFT";
  const symbol = "NTNFT";
  const uri = "https://example.com";

  beforeAll(async () => {
    await initializeOrgV1(context, {
      superAdminAddress,
      orgId: orgId,
    }).sendAndConfirm(context);

    await context.rpc.airdrop(claimerAddress, sol(1));
  });

  it("creates a non-transferable project", async () => {
    await initializeLegacyProjectV1(context, {
      superAdminAddress,
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
    await mintNonTransferableNftV1(context, {
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
    await claimNonTransferableNftV1(context, {
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

    const metadata = await fetchMetadataFromSeeds(context, {
      mint: nftMintAddress,
    });

    expect(metadata.creators.__option).toBe("Some");

    // await updateNonTransferableNft(context, {
    //   superAdminAddress,
    //   orgId: orgId.toString(),
    //   projectIdStr: projectId.toString(),
    //   nftIdStr: nftId.toString(),
    //   name: "Saga Genesis",
    //   symbol: "Saga Ge",
    // }).sendAndConfirm(context);

    // const metadata2 = await fetchMetadataFromSeeds(context, { mint: nftMintAddress });
    // console.log(metadata2)
  });

  it("revokes a non-transferable nft", async () => {
    await revokeNonTransferableNftV1(context, {
      superAdminAddress,
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

    await burnNonTransferableNftV1(context, {
      superAdminAddress,
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
