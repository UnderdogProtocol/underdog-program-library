import { Context, Pda, PublicKey } from "@metaplex-foundation/umi";
import {
  string,
  publicKey as publicKeySerializer,
} from "@metaplex-foundation/umi/serializers";

export function findLegacyNftPda(
  context: Pick<Context, "eddsa" | "programs">,
  seeds: {
    prefix: string;
    orgAccount: PublicKey;
    projectId: string;
    nftId: string;
  }
): Pda {
  const programId = context.programs.getPublicKey(
    "underdogCore",
    "updg8JyjrmFE2h3d71p71zRXDR8q4C6Up8dDoeq3LTM"
  );
  return context.eddsa.findPda(programId, [
    string({ size: "variable" }).serialize(seeds.prefix),
    publicKeySerializer().serialize(seeds.orgAccount),
    string({ size: "variable" }).serialize(seeds.projectId),
    string({ size: "variable" }).serialize(seeds.nftId),
  ]);
}
