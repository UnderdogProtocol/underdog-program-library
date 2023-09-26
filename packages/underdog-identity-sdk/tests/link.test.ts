import {
  Creator,
  createTree,
  getMerkleProofAtIndex,
  getMerkleRoot,
  hashLeaf,
  hashMetadataCreators,
  hashMetadataData,
  mintV1,
  verifyLeaf,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  generateSigner,
  publicKey,
  publicKeyBytes,
  sol,
} from "@metaplex-foundation/umi";

import {
  fetchLinkFromSeeds,
  findLinkPda,
  initializeLinkV0,
  transferAssetV0,
} from "../src/generated";
import { createContext } from "./setup";

describe("Initialize Link", () => {
  const context = createContext();

  const linkerSigner = generateSigner(context);

  const namespace = "underdog";
  const email = "kevin@underdogprotocol.com";

  beforeAll(async () => {
    await context.rpc.airdrop(linkerSigner.publicKey, sol(1));
  });

  it("initializes link", async () => {
    await initializeLinkV0(context, {
      linker: linkerSigner,
      namespace,
      identifier: email,
    }).sendAndConfirm(context);

    const link = await fetchLinkFromSeeds(context, {
      namespace,
      identifier: email,
    });

    expect(link.address).toEqual(linkerSigner.publicKey);
  });

  describe("Transfer", () => {
    const link = findLinkPda(context, { namespace, identifier: email })[0];

    const maxDepth = 3;
    const merkleTreeSigner = generateSigner(context);
    const leafIndex = 0;

    const receiverAddress = generateSigner(context).publicKey;

    const creators: Creator[] = [];
    const metadata = {
      name: "",
      symbol: undefined,
      uri: "",
      sellerFeeBasisPoints: 0,
      primarySaleHappened: undefined,
      isMutable: undefined,
      editionNonce: undefined,
      tokenStandard: undefined,
      collection: null,
      uses: undefined,
      tokenProgramVersion: undefined,
      creators,
    };

    const creatorHash = hashMetadataCreators(creators);
    const dataHash = hashMetadataData(metadata);
    const leafHash = hashLeaf(context, {
      merkleTree: merkleTreeSigner.publicKey,
      owner: link,
      leafIndex,
      metadata,
    });

    const leaves = [publicKey(leafHash)];

    beforeAll(async () => {
      await (
        await createTree(context, {
          maxDepth,
          maxBufferSize: 8,
          merkleTree: merkleTreeSigner,
        })
      ).sendAndConfirm(context);

      await mintV1(context, {
        leafOwner: findLinkPda(context, { namespace, identifier: email })[0],
        merkleTree: merkleTreeSigner.publicKey,
        metadata,
      }).sendAndConfirm(context);
    });

    it("can transfer", async () => {
      await transferAssetV0(context, {
        authority: linkerSigner,
        receiverAddress,
        merkleTree: merkleTreeSigner.publicKey,
        root: publicKeyBytes(getMerkleRoot(leaves, maxDepth)),
        dataHash: dataHash,
        creatorHash: creatorHash,
        leafIndex,
        namespace,
        identifier: email,
        proof: getMerkleProofAtIndex(leaves, maxDepth, leafIndex).map((p) =>
          publicKey(p)
        ),
      }).sendAndConfirm(context);
    });

    it("can verify", async () => {
      const transferredLeafHash = hashLeaf(context, {
        merkleTree: merkleTreeSigner.publicKey,
        owner: receiverAddress,
        leafIndex,
        metadata,
      });

      await verifyLeaf(context, {
        merkleTree: merkleTreeSigner.publicKey,
        root: publicKeyBytes(
          getMerkleRoot([publicKey(transferredLeafHash)], maxDepth)
        ),
        leaf: transferredLeafHash,
        index: leafIndex,
      }).sendAndConfirm(context);
    });
  });
});
