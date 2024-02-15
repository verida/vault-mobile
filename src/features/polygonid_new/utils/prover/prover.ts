import { byteDecoder } from '@0xpolygonid/js-sdk'
import { ZKProof } from '@iden3/js-jwz'
import { NativeModules } from 'react-native'
import { fromByteArray } from 'react-native-quick-base64'

import { WitnessCalculatorFunction } from '../../types'

const rapidsnark = NativeModules.Rapidsnark

export const prove = async (
  inputs: Uint8Array,
  provingKey: Uint8Array,
  wasm: Uint8Array,
  witnessCalculator: WitnessCalculatorFunction
): Promise<ZKProof> => {
  const parsedData = JSON.parse(byteDecoder.decode(inputs))

  const witness = await witnessCalculator(wasm, parsedData)

  const { proof, pub_signals } = await rapidsnark.groth16_prover(
    fromByteArray(provingKey),
    witness
  )

  return {
    proof: JSON.parse(proof),
    pub_signals: JSON.parse(pub_signals),
  }
}
