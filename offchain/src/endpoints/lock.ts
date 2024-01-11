import {
  Data,
  Lucid,
  SpendingValidator,
  TxComplete,
} from "@anastasia-labs/lucid-cardano-fork";
import { MyDatum } from "../core/contract.types.js";
import { Result } from "../core/types.js";

export async function lock(
  lucid: Lucid,
  {
    lovelace,
    validator,
    datum,
  }: {
    lovelace: bigint;
    validator: SpendingValidator;
    datum: MyDatum;
  }
): Promise<Result<TxComplete>> {
  const contractAddress = lucid.utils.validatorToAddress(validator);

  try {
    const tx = await lucid
      .newTx()
      .payToContract(
        contractAddress,
        { inline: Data.to<MyDatum>(datum, MyDatum) },
        { lovelace }
      )
      .complete();
    return { type: "ok", data: tx };
  } catch (error) {
    if (error instanceof Error) return { type: "error", error: error };
    return { type: "error", error: new Error(`${JSON.stringify(error)}`) };
  }
}
