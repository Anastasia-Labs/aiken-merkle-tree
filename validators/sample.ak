use aiken/transaction.{OutputReference, ScriptContext, Spend, TransactionId}
use aiken_merkle_tree/mt.{Proof, Root, from_list, get_proof, is_member, root}

type MyDatum {
  merkle_root: Root,
}

type MyRedeemer {
  my_proof: Proof<ByteArray>,
  user_data: ByteArray,
}

validator {
  fn spend_validator(datum: MyDatum, redeemer: MyRedeemer, _ctx: ScriptContext) {
    let MyDatum { merkle_root } = datum
    let MyRedeemer { my_proof, user_data } = redeemer
    is_member(merkle_root, user_data, my_proof, identity)
  }
}

test spend_validator_1() {
  let data =
    ["dog", "cat", "mouse"]
  let merkle_tree = from_list(data, identity)
  let datum = MyDatum { merkle_root: root(merkle_tree) }
  expect Some(proof) = get_proof(merkle_tree, "cat", identity)
  let redeemer = MyRedeemer { my_proof: proof, user_data: "cat" }
  let placeholder_utxo =
    OutputReference { transaction_id: TransactionId(""), output_index: 0 }
  let context =
    ScriptContext {
      purpose: Spend(placeholder_utxo),
      transaction: transaction.placeholder(),
    }
  spend_validator(datum, redeemer, context)
}
