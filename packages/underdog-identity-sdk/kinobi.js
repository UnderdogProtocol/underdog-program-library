const k = require("@metaplex-foundation/kinobi");
let path = require("path");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(__dirname, "..", "..", "idls", "underdog_identity.json")]);

// Update accounts.
kinobi.update(
  new k.UpdateAccountsVisitor({
    admin: {
      seeds: [k.stringConstantSeed("underdog_identity_admin")],
    },
    link: {
      seeds: [k.stringSeed("namespace"), k.stringSeed("identifier")],
    },
  })
);

kinobi.update(
  new k.SetInstructionAccountDefaultValuesVisitor([
    {
      account: "admin",
      ignoreIfOptional: true,
      ...k.pdaDefault("admin"),
    },
    {
      account: "link",
      ignoreIfOptional: true,
      ...k.pdaDefault("link", {
        seeds: {
          namespace: k.argDefault("namespace"),
          identifier: k.argDefault("identifier")
        },
      }),
    },
    {
      account: "logWrapper",
      ignoreIfOptional: true,
      ...k.programDefault("splNoop", "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
    },
    {
      account: "compressionProgram",
      ignoreIfOptional: true,
      ...k.programDefault("splAccountCompression", "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"),
    },
    {
      account: "bubblegumProgram",
      ignoreIfOptional: true,
      ...k.programDefault("bubblegumProgram", "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"),
    },
    {
      account: "treeAuthority",
      ...k.pdaDefault("treeConfig", {
        importFrom: "mplBubblegum",
        seeds: { merkleTree: k.accountDefault("merkleTree") },
      }),
    },
    {
      account: "bubblegumSigner",
      ignoreIfOptional: true,
      ...k.publicKeyDefault("4ewWZC5gT6TGpm5LZNDs9wVonfUT2q5PP5sc9kVbwMAK"),
    },
  ])
);

// Custom tree updates.
kinobi.update(
  new k.TransformNodesVisitor([
    {
      // Use extra "proof" arg as remaining accounts.
      selector: (node) => k.isInstructionNode(node) && ["transferAssetV0", "burnAssetV0"].includes(node.name),
      transformer: (node) => {
        k.assertInstructionNode(node);
        return k.instructionNode({
          ...node,
          remainingAccounts: k.remainingAccountsFromArg("proof"),
          argDefaults: {
            ...node.argDefaults,
            proof: k.valueDefault(k.vList([])),
          },
          extraArgs: k.instructionExtraArgsNode({
            ...node.extraArgs,
            struct: k.structTypeNode([
              ...node.extraArgs.struct.fields,
              k.structFieldTypeNode({
                name: "proof",
                child: k.arrayTypeNode(k.publicKeyTypeNode()),
              }),
            ]),
          }),
        });
      },
    },
  ])
);

// Render JavaScript.
const jsDir = path.join(__dirname, "src", "generated");

const visitor = new k.RenderJavaScriptVisitor(jsDir, {
  dependencyMap: {
    mplTokenMetadata: "@metaplex-foundation/mpl-token-metadata",
    mplBubblegum: "@metaplex-foundation/mpl-bubblegum",
    mplToolbox: "@metaplex-foundation/mpl-toolbox",
  },
});

kinobi.accept(visitor);
