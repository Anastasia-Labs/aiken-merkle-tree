import { Data } from "@anastasia-labs/lucid-cardano-fork";

const RootSchema = Data.Bytes();
export type Root = Data.Static<typeof RootSchema>;
export const Root = RootSchema as unknown as Root;

const ProofItemSchema = Data.Enum([
  Data.Object({
    Left: Data.Tuple([Data.Bytes()]),
  }),
  Data.Object({
    Right: Data.Tuple([Data.Bytes()]),
  }),
]);
export type ProofItem = Data.Static<typeof ProofItemSchema>;
export const ProofItem = ProofItemSchema as unknown as ProofItem;

const ProofSchema = Data.Array(ProofItemSchema);
export type Proof = Data.Static<typeof ProofSchema>;
export const Proof = ProofSchema as unknown as Proof;

const MyDatumSchema = Data.Object({
  merkle_root: RootSchema,
});

export type MyDatum = Data.Static<typeof MyDatumSchema>;
export const MyDatum = MyDatumSchema as unknown as MyDatum;

export const MyRedeemerSchema = Data.Object({
  my_proof: ProofSchema,
  user_data: Data.Bytes(),
});

export type MyRedeemer = Data.Static<typeof MyRedeemerSchema>;
export const MyRedeemer = MyRedeemerSchema as unknown as MyRedeemer;
