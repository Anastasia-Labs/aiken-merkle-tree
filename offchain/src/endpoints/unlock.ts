import {
  Data,
  Lucid,
  SpendingValidator,
  TxComplete,
  TxHash,
  UTxO,
} from "@anastasia-labs/lucid-cardano-fork";
import { MyRedeemer } from "../core/contract.types.js";
import { Result } from "../index.js";

export async function unlock(
  lucid: Lucid,
  {
    utxos,
    redeemer,
    validator,
  }: {
    utxos: UTxO[];
    redeemer: MyRedeemer;
    validator: SpendingValidator;
  }
): Promise<Result<TxComplete>> {
  console.log(
    "Data.to<MyRedeemer>(redeemer, MyRedeemer) :>> ",
    Data.to<MyRedeemer>(redeemer, MyRedeemer)
  );
  console.log("Data.void() :>> ", Data.void());
  try {
    const tx = await lucid
      .newTx()
      .collectFrom(utxos, Data.void())
      .attachSpendingValidator(validator)
      .complete();
    return { type: "ok", data: tx };
  } catch (error) {
    if (error instanceof Error) return { type: "error", error: error };
    return { type: "error", error: new Error(`${JSON.stringify(error)}`) };
  }
}
