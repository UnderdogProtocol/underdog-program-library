import axios from "axios";
import { generateSigner } from "@metaplex-foundation/umi";

import {
  findInscriptionShardPda,
  findInscriptionMetadataPda,
} from "@metaplex-foundation/mpl-inscription";

import {
  findOrgAccountPda,
  initializeOrgV1,
  inscribeImageV0,
} from "../../src/generated";
import { createContext } from "../setup";

describe("Projects", () => {
  const context = createContext();

  const superAdminAddress = generateSigner(context).publicKey;
  const orgId = "1";
  const orgAccount = findOrgAccountPda(context, {
    superAdminAddress,
    orgId,
  })[0];

  const owner = generateSigner(context).publicKey;

  beforeAll(async () => {
    await initializeOrgV1(context, {
      superAdminAddress,
      orgId: orgId,
    }).sendAndConfirm(context);
  });

  describe("Inscribe Image", () => {
    it("works", async () => {
      const inscriptionAccount = generateSigner(context);

      const response = await axios.get(
        "https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link/",
        { responseType: "arraybuffer" }
      );

      await inscribeImageV0(context, {
        inscriptionAccount,
        inscriptionMetadataAccount: findInscriptionMetadataPda(context, {
          inscriptionAccount: inscriptionAccount.publicKey,
        })[0],
        inscriptionShardAccount: findInscriptionShardPda(context, {
          shardNumber: 0,
        })[0],
        superAdminAddress,
        orgId,
        value: Buffer.from(
          '{"description": "A bread! But on-chain!", "external_url": "https://breadheads.io"}'
        ),
      }).sendAndConfirm(context);

      // const shard = await fetchInscriptionShardFromSeeds(context, {
      //   shardNumber: 0,
      // });

      const data = await context.rpc.getAccount(inscriptionAccount.publicKey);
      if (data.exists) {
        const jsonString = Buffer.from(data.data).toString("utf8");
        console.log(jsonString);
      }
    });
  });
});
