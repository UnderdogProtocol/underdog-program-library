import { createUmi } from "@metaplex-foundation/umi";
import { web3JsEddsa } from "@metaplex-foundation/umi-eddsa-web3js";
import { defaultProgramRepository } from "@metaplex-foundation/umi-program-repository";
import { createPassportProgram } from "./generated";

const context = createUmi();

context.use(defaultProgramRepository());
context.use(web3JsEddsa());

context.programs.add(createPassportProgram());

export { context };
