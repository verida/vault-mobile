import { ProvingMethod, ProvingMethodAlg, ZKProof } from '@iden3/js-jwz'
import { Logger } from 'features/telemetry'

import { CalculateWitnessFunction } from '../../types'
import { prove } from './prover'
import { verify } from './verifier'

const logger = Logger.create('PolygonId')

export class Groth16ProvingMethod implements ProvingMethod {
  constructor(
    public readonly methodAlg: ProvingMethodAlg,
    public calculateWitness: CalculateWitnessFunction
  ) {
    // nothing
  }

  get alg(): string {
    return this.methodAlg.alg
  }

  get circuitId(): string {
    return this.methodAlg.circuitId
  }

  async verify(
    _messageHash: Uint8Array,
    proof: ZKProof,
    verificationKey: Uint8Array
  ): Promise<boolean> {
    logger.info('Verifying with Groth16ProvingMethod...')
    return verify(proof, verificationKey)
  }

  async prove(
    inputs: Uint8Array,
    provingKey: Uint8Array,
    wasm: Uint8Array
  ): Promise<ZKProof> {
    logger.info('Proving with Groth16ProvingMethod...')
    return prove(inputs, provingKey, wasm, this.calculateWitness)
  }
}
