import { Lucid } from "@anastasia-labs/lucid-cardano-fork";
import { CborHex } from "../core/types.js";
import { MyDatum, parseUTxOsAtScript } from "../index.js";

export async function getScriptUTxOsByAddress(lucid: Lucid, script: CborHex) {
  return await parseUTxOsAtScript<MyDatum>(lucid, script, MyDatum);
}
