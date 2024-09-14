import { fetchMetadataFromSeeds } from "@metaplex-foundation/mpl-token-metadata";
import { createBigInt, generateSigner, sol } from "@metaplex-foundation/umi";

import { findProjectAddresses } from "../../src";
import {
  fetchProject,
  getProjectSize,
  initializeOrgV1,
  initializeProjectV1,
  updateProjectV2,
  withdrawProjectRoyaltiesV0,
} from "../../src/generated";
import { createContext } from "../setup";
import { generateMetadataMock, generateProjectMock } from "../mocks";

describe("Projects", () => {
  const context = createContext();

  const projectInput = generateProjectMock(context);
  const { superAdminAddress, orgId, projectId } = projectInput;
  const { projectAddress, projectMintAddress } = findProjectAddresses(
    context,
    projectInput
  );

  beforeAll(async () => {
    await initializeOrgV1(context, {
      superAdminAddress,
      orgId: orgId.toString(),
    }).sendAndConfirm(context);
  });

  it("initializes a project", async () => {
    const metadata = generateMetadataMock();

    await initializeProjectV1(context, {
      superAdminAddress,
      orgId: orgId.toString(),
      projectId,
      ...metadata,
    }).sendAndConfirm(context);

    const project = await fetchProject(context, projectAddress);

    expect(project.projectId).toEqual(createBigInt(projectId));

    const projectMetadata = await fetchMetadataFromSeeds(context, {
      mint: projectMintAddress,
    });

    expect(projectMetadata.name).toEqual(metadata.name);
    expect(projectMetadata.symbol).toEqual(metadata.symbol);
    expect(projectMetadata.uri).toEqual(metadata.uri);
    expect(projectMetadata.sellerFeeBasisPoints).toEqual(
      metadata.sellerFeeBasisPoints
    );
  });

  it("can update a project", async () => {
    const updatedMetadata = generateMetadataMock({ sellerFeeBasisPoints: 100 });

    await updateProjectV2(context, {
      ...projectInput,
      orgId: orgId.toString(),
      metadata: updatedMetadata,
      collectionMint: projectMintAddress,
    }).sendAndConfirm(context);

    const projectMetadata = await fetchMetadataFromSeeds(context, {
      mint: projectMintAddress,
    });

    expect(projectMetadata.name).toEqual(updatedMetadata.name);
    expect(projectMetadata.symbol).toEqual(updatedMetadata.symbol);
    expect(projectMetadata.uri).toEqual(updatedMetadata.uri);
    expect(projectMetadata.sellerFeeBasisPoints).toEqual(100);
  });

  describe("Project Royalties", () => {
    beforeAll(async () => {
      const projectBalance = await context.rpc.getBalance(projectAddress);

      expect(projectBalance).toEqual(
        await context.rpc.getRent(getProjectSize())
      );

      await context.rpc.airdrop(projectAddress, sol(1));
    });

    it("can withdraw royalties", async () => {
      const destination = generateSigner(context).publicKey;

      await withdrawProjectRoyaltiesV0(context, {
        superAdminAddress,
        orgId: orgId.toString(),
        projectId,
        destination,
      }).sendAndConfirm(context);

      const projectBalance = await context.rpc.getBalance(projectAddress);

      expect(projectBalance).toEqual(
        await context.rpc.getRent(getProjectSize())
      );

      const destinationBalance = await context.rpc.getBalance(destination);
      expect(destinationBalance).toEqual(sol(1));
    });
  });
});
