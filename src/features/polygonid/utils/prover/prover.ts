import { byteDecoder } from '@0xpolygonid/js-sdk'
import { ZKProof } from '@iden3/js-jwz'
import { groth16Prove } from '@iden3/react-native-rapidsnark'
import { fromByteArray } from 'react-native-quick-base64'

import { Logger } from '~/features/telemetry'

import { CalculateWitnessFunction } from '../../types'

const logger = Logger.create('PolygonId')

export const prove = async (
  inputs: Uint8Array,
  provingKey: Uint8Array,
  wasm: Uint8Array,
  calculateWitness: CalculateWitnessFunction
): Promise<ZKProof> => {
  logger.debug('Proving inputs...')
  const parsedInputs = JSON.parse(byteDecoder.decode(inputs))

  logger.debug('Execute witness calculator')
  const witness = await calculateWitness(wasm, parsedInputs)
  if (!witness) {
    // TODO: Have the calculateWitness throw an error instead, then wrap it with a trycatch to throw a 'Witness calculator failed' error and pass the original error as cause
    throw new Error('Witness calculator failed')
  }
  logger.debug('Witness calculator successfully executed')

  logger.debug('Executing groth16Prove...')
  const { proof, pub_signals } = await groth16Prove(
    fromByteArray(provingKey),
    witness
  )
  logger.debug('groth16Prove executed successfully')

  return {
    proof: JSON.parse(proof),
    pub_signals: JSON.parse(pub_signals),
  }
}
