import {
  Lucid,
  generateSeedPhrase,
  Assets,
  Data,
  SpendingValidator,
  toHex,
} from "@anastasia-labs/lucid-cardano-fork";
import { Either, ReadableUTxO } from "../core/types.js";

export const generateAccountSeedPhrase = async (assets: Assets) => {
  const seedPhrase = generateSeedPhrase();
  return {
    seedPhrase,
    address: await (await Lucid.new(undefined, "Custom"))
      .selectWalletFromSeed(seedPhrase)
      .wallet.address(),
    assets,
  };
};

export const utxosAtScript = async (
  lucid: Lucid,
  script: string,
  stakeCredentialHash?: string
) => {
  const scriptValidator: SpendingValidator = {
    type: "PlutusV2",
    script: script,
  };

  const scriptValidatorAddr = stakeCredentialHash
    ? lucid.utils.validatorToAddress(
        scriptValidator,
        lucid.utils.keyHashToCredential(stakeCredentialHash)
      )
    : lucid.utils.validatorToAddress(scriptValidator);

  return lucid.utxosAt(scriptValidatorAddr);
};

export const parseSafeDatum = <T>(
  lucid: Lucid,
  datum: string | null | undefined,
  datumType: T
): Either<string, T> => {
  if (datum) {
    try {
      const parsedDatum = Data.from(datum, datumType);
      return {
        type: "right",
        value: parsedDatum,
      };
    } catch (error) {
      return { type: "left", value: `invalid datum : ${error}` };
    }
  } else {
    return { type: "left", value: "missing datum" };
  }
};

export const parseUTxOsAtScript = async <T>(
  lucid: Lucid,
  script: string,
  datumType: T,
  stakeCredentialHash?: string
): Promise<ReadableUTxO<T>[]> => {
  //FIX: this can throw an error if script is empty or not initialized
  const utxos = await utxosAtScript(lucid, script, stakeCredentialHash);
  return utxos.flatMap((utxo) => {
    const result = parseSafeDatum<T>(lucid, utxo.datum, datumType);
    if (result.type == "right") {
      return {
        outRef: {
          txHash: utxo.txHash,
          outputIndex: utxo.outputIndex,
        },
        datum: result.value,
        assets: utxo.assets,
      };
    } else {
      return [];
    }
  });
};

type Hash = Uint8Array;

type MerkleTreeProof = Array<{
  left?: Hash;
  right?: Hash;
}>;

export function convertProof(proof: MerkleTreeProof) {
  const result = [];
  for (const item of proof) {
    if (item.left) {
      result.push({
        Left: [toHex(item.left)],
      });
    } else if (item.right) {
      result.push({
        Right: [toHex(item.right)],
      });
    }
  }
  return result;
}

121(
  [
    [122(
      [h'8E8A6CB359BB83F141498D96A80D7A9CE4C5558C115660820E0F2AC13555D934']
    )]
    , h'61'
  ]
)

121(
  [h'16CE3DFE44B065B8B9A940C25C424C064DE4DB1CC914B5970B2D56B6DD18522A']
)
