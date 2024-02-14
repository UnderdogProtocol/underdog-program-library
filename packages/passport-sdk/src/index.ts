import { createNoopSigner, publicKey } from "@metaplex-foundation/umi";
import { activatePassportV1, findLinkPda } from "./generated";
import { context } from "./context";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

export * from "./generated";

type SeedsInput = {
  namespace?: string;
  identifier: string;
};

const getNamespaceFromSeeds = (seeds: SeedsInput) => {
  return (
    seeds.namespace ||
    process.env.NAMESPACE ||
    process.env.NEXT_PUBLIC_NAMESPACE ||
    "public"
  );
};

export const getPassportAddress = (seeds: SeedsInput) => {
  const namespace = getNamespaceFromSeeds(seeds);

  return findLinkPda(context, { ...seeds, namespace })[0];
};

export const activatePassportInstruction = (
  seeds: SeedsInput,
  domainAuthority: string,
  passportAuthority: string,
  payer?: string
) => {
  const namespace = getNamespaceFromSeeds(seeds);

  return toWeb3JsInstruction(
    activatePassportV1(context, {
      ...seeds,
      namespace,
      domainAuthority: createNoopSigner(publicKey(domainAuthority)),
      passportAuthority: createNoopSigner(publicKey(passportAuthority)),
      payer: payer ? createNoopSigner(publicKey(payer)) : undefined,
    }).getInstructions()[0]
  );
};
