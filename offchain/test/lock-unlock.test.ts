import {
  generateAccountSeedPhrase,
  Lucid,
  Emulator,
  toUnit,
  toHex,
  fromHex,
  MyDatum,
  MerkleTree,
  C,
  lock,
  Script,
  utxosAtScript,
  unlock,
  MyRedeemer,
  convertProof,
} from "../src/index.js";
import { beforeEach, expect, test } from "vitest";
import plutus from "../../plutus.json";
import * as cbor from "cbor";

type LucidContext = {
  lucid: Lucid;
  users: any;
  emulator: Emulator;
};

//NOTE: INITIALIZE EMULATOR + ACCOUNTS
beforeEach<LucidContext>(async (context) => {
  context.users = {
    account1: await generateAccountSeedPhrase({
      lovelace: BigInt(100_000_000),
      [toUnit(
        "2c04fa26b36a376440b0615a7cdf1a0c2df061df89c8c055e2650505",
        "63425443"
      )]: BigInt(100_00_000_000),
    }),
    account2: await generateAccountSeedPhrase({
      lovelace: BigInt(100_000_000),
    }),
    account3: await generateAccountSeedPhrase({
      lovelace: BigInt(100_000_000),
    }),
  };

  context.emulator = new Emulator([
    context.users.account1,
    context.users.account2,
    context.users.account3,
  ]);

  context.lucid = await Lucid.new(context.emulator);
});

test<LucidContext>("Test - Lock Tokens, Unlock Tokens", async ({
  lucid,
  users,
  emulator,
}) => {
  lucid.selectWalletFromSeed(users.account1.seedPhrase);
  const validator: Script = {
    type: "PlutusV2",
    script: toHex(cbor.encode(fromHex(plutus.validators[0].compiledCode))),
  };

  console.log("validator :>> ", validator);
  const data = [Buffer.from("a"), Buffer.from("b"), Buffer.from("c")];
  const merkleTree = new MerkleTree(data);
  const rootHash = merkleTree.rootHash();
  const proof = merkleTree.getProof(data[0]);
  const myDatum: MyDatum = {
    merkle_root: toHex(rootHash),
  };
  const myRedeemer: MyRedeemer = {
    my_proof: convertProof(proof),
    user_data: toHex(data[0]),
  };

  const lockUnsigned = await lock(lucid, {
    lovelace: 10_000_000n,
    validator: validator,
    datum: myDatum,
  });
  expect(lockUnsigned.type).toBe("ok");
  if (lockUnsigned.type == "ok") {
    const lockSigned = await lockUnsigned.data.sign().complete();
    const lockHash = await lockSigned.submit();
    await lucid.awaitTx(lockHash);
  }

  //NOTE: INSTALLMENT 1
  emulator.awaitBlock(1080);

  const utxos = await utxosAtScript(lucid, validator.script);

  console.log("utxos :>> ", utxos);
  const unlockUnsigned = await unlock(lucid, {
    utxos: utxos,
    redeemer: myRedeemer,
    validator,
  });
  console.log("unlockUnsigned :>> ", unlockUnsigned);
  expect(unlockUnsigned.type).toBe("ok");
  if (unlockUnsigned.type == "ok") {
    const unlockSigned = await unlockUnsigned.data.sign().complete();
    const unlockHash = await unlockSigned.submit();
    await lucid.awaitTx(unlockHash);
  }
});
