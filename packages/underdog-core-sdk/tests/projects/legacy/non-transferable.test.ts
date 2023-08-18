import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";
import {
  burnNonTransferableNft,
  claimNonTransferableNft,
  fetchClaimAccountFromSeeds,
  fetchLegacyProjectFromSeeds,
  findLegacyProjectPda,
  findOrgAccountPda,
  initializeLegacyProject,
  initializeOrg,
  revokeNonTransferableNft,
} from "../../../src/generated";
import { createUmi } from "../../setup";
import { mintNonTransferableNftAndVerifyCollection } from "../../../src";
import {
  fetchAllTokenByOwnerAndMint,
  fetchToken,
} from "@metaplex-foundation/mpl-toolbox";
import { findLegacyNftPda } from "@underdog-protocol/spl-utils";

describe("Non-Transferable Projects", () => {
  const umi = createUmi();

  const superAdminAddress = generateSigner(umi).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();
  const nftId = 1;
  const nftIdStr = nftId.toString();
  const orgControlSigner = generateSigner(umi);
  const orgControlAddress = orgControlSigner.publicKey;

  const claimerSigner = generateSigner(umi);
  const claimerAddress = claimerSigner.publicKey;

  const name = "Non-Transferable NFT";
  const symbol = "NTNFT";
  const uri = "https://example.com";

  beforeAll(async () => {
    await initializeOrg(umi, {
      superAdminAddress,
      orgId: orgId,
      orgControlAddress: orgControlAddress,
    }).sendAndConfirm(umi);

    await umi.rpc.airdrop(orgControlAddress, sol(1));
    await umi.rpc.airdrop(claimerAddress, sol(1));
  });

  it("creates a non-transferable project", async () => {
    await initializeLegacyProject(umi, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      name,
      symbol,
      uri,
      projectType: "n",
    }).sendAndConfirm(umi);

    const nonTransferableProject = await fetchLegacyProjectFromSeeds(umi, {
      orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
      projectId: projectIdStr,
      type: "nt-proj",
    });

    expect(nonTransferableProject.projectId).toEqual(createBigInt(projectId));
  });

  it("mints a non-transferable nft", async () => {
    await mintNonTransferableNftAndVerifyCollection(umi, {
      authority: orgControlSigner,
      superAdminAddress,
      orgId,
      memberAddress: superAdminAddress,
      claimerAddress,
      projectIdStr,
      nftIdStr,
      name,
      symbol,
      uri,
    }).sendAndConfirm(umi);

    const claimAccount = await fetchClaimAccountFromSeeds(umi, {
      orgAccount: findOrgAccountPda(umi, {
        superAdminAddress,
        orgId,
      })[0],
      projectId: projectIdStr,
      nftId: nftIdStr,
    });

    expect(claimAccount.claimer).toEqual(claimerAddress);
  });

  const nftMintAddress = findLegacyNftPda(umi, {
    prefix: "nt-nft-mint",
    orgAccount: findOrgAccountPda(umi, {
      superAdminAddress,
      orgId,
    })[0],
    projectId: projectIdStr,
    nftId: nftIdStr,
  })[0];

  it("claims a non-transferable nft", async () => {
    await claimNonTransferableNft(umi, {
      authority: orgControlSigner,
      claimer: claimerSigner,
      superAdminAddress,
      orgId,
      projectIdStr,
      nftIdStr,
    }).sendAndConfirm(umi);

    const tokens = await fetchAllTokenByOwnerAndMint(
      umi,
      claimerAddress,
      nftMintAddress
    );

    expect(tokens.length).toEqual(1);
  });

  it("revokes a non-transferable nft", async () => {
    await revokeNonTransferableNft(umi, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      claimer: claimerSigner.publicKey,
      orgId,
      projectIdStr,
      nftIdStr,
    }).sendAndConfirm(umi);

    const tokens = await fetchAllTokenByOwnerAndMint(
      umi,
      claimerAddress,
      nftMintAddress
    );

    expect(tokens.length).toEqual(0);
  });

  it("burns a non-transferable nft", async () => {
    const tokensBeforeBurn = await fetchAllTokenByOwnerAndMint(
      umi,
      findLegacyProjectPda(umi, {
        type: "nt-proj",
        orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
        projectId: projectIdStr
      })[0],
      nftMintAddress
    );

    expect(tokensBeforeBurn.length).toEqual(1);

    await burnNonTransferableNft(umi, {
      authority: orgControlSigner,
      superAdminAddress,
      memberAddress: superAdminAddress,
      orgId,
      projectIdStr,
      nftIdStr,
    }).sendAndConfirm(umi);

    const tokensAfterBurn = await fetchAllTokenByOwnerAndMint(
      umi,
      findLegacyProjectPda(umi, {
        type: "nt-proj",
        orgAccount: findOrgAccountPda(umi, { superAdminAddress, orgId })[0],
        projectId: projectIdStr
      })[0],
      nftMintAddress
    );

    expect(tokensAfterBurn.length).toEqual(0);
  });
});
