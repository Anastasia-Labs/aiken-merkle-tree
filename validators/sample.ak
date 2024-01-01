use aiken/transaction.{ScriptContext}
use aiken_merkle_tree/mt.{Proof, Root, is_member}

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
