const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "idls");
const binaryInstallDir = path.join(__dirname, ".crates");
const programDir = path.join(__dirname, "programs");

// From an Anchor program.
generateIdl({
  generator: "anchor",
  programName: "underdog_core",
  programId: "updg8JyjrmFE2h3d71p71zRXDR8q4C6Up8dDoeq3LTM",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "underdog-core"),
});

generateIdl({
  generator: "anchor",
  programName: "passport",
  programId: "upUcvW7nF6ymrAFKborbq3vrbdpuokAvJheqHX5Qxtd",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "passport"),
});
