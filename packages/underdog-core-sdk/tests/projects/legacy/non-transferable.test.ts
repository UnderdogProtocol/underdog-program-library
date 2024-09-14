import {
  fetchAllTokenByOwnerAndMint,
  findAssociatedTokenPda,
  setComputeUnitLimit,
} from "@metaplex-foundation/mpl-toolbox";
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
  updateLegacyProjectV0,
} from "../../../src/generated";
import { createContext } from "../../setup";
import {
  findLegacyNftPda,
  findOrgAddress,
  NON_TRANSFERABLE_NFT_MINT_PREFIX,
} from "../../../src";
import { fetchMetadataFromSeeds } from "@metaplex-foundation/mpl-token-metadata";

describe("Non-Transferable Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const projectId = 1;
  const projectIdStr = projectId.toString();
  const nftId = 1;
  const nftIdStr = nftId.toString();

  const orgAccount = findOrgAccountPda(context, {
    superAdminAddress,
    orgId,
  })[0];

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
      name: "",
      symbol: "",
      uri: "",
      projectType: "n",
    }).sendAndConfirm(context);

    const nonTransferableProject = await fetchLegacyProjectFromSeeds(context, {
      orgAccount,
      projectId: projectIdStr,
      type: "nt-proj",
    });

    expect(nonTransferableProject.projectId).toEqual(createBigInt(projectId));

    const metadata = await fetchMetadataFromSeeds(context, {
      mint: findLegacyProjectPda(context, {
        type: "nt-project-mint",
        orgAccount,
        projectId: projectIdStr,
      })[0],
    });

    expect(metadata.name).toEqual("");
  });

  it("updates a non-transferable project", async () => {
    await updateLegacyProjectV0(context, {
      superAdminAddress,
      orgId,
      projectIdStr,
      projectType: "n",
      metadata: { name, symbol, uri, sellerFeeBasisPoints: 0 },
    }).sendAndConfirm(context);

    const metadata = await fetchMetadataFromSeeds(context, {
      mint: findLegacyProjectPda(context, {
        type: "nt-project-mint",
        orgAccount,
        projectId: projectIdStr,
      })[0],
    });

    expect(metadata.name).toEqual(name);
  });

  it("mints a non-transferable nft", async () => {
    await setComputeUnitLimit(context, { units: 300_000 })
      .add(
        mintNonTransferableNftV1(context, {
          superAdminAddress,
          orgId,
          claimerAddress,
          projectIdStr,
          nftIdStr,
          name,
          symbol,
          uri,
          claimer: claimerSigner,
        })
      )
      .sendAndConfirm(context);
    // const claimAccount = await fetchClaimAccountFromSeeds(context, {
    //   orgAccount: findOrgAccountPda(context, {
    //     superAdminAddress,
    //     orgId,
    //   })[0],
    //   projectId: projectIdStr,
    //   nftId: nftIdStr,
    // });

    // expect(claimAccount.claimer).toEqual(claimerAddress);
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
    await burnNonTransferableNftV1(context, {
      superAdminAddress,
      orgId,
      projectIdStr,
      nftIdStr,
    }).sendAndConfirm(context);
  });
});
