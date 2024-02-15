import { CircuitId, ICircuitStorage, IZKProver } from '@0xpolygonid/js-sdk'
import { ZKProof } from '@iden3/js-jwz'

import { WitnessCalculatorFunction } from '../../types'
import { prove } from './prover'

export class ZkProver implements IZKProver {
  constructor(
    private readonly circuitStorage: ICircuitStorage,
    public witnessCalculator: WitnessCalculatorFunction
  ) {}

  async verify(zkp: ZKProof, circuitId: CircuitId): Promise<boolean> {
    try {
      const circuitData = await this.circuitStorage.loadCircuitData(circuitId)

      if (!circuitData.verificationKey) {
        throw new Error(
          `verification file doesn't exist for circuit ${circuitId}`
        )
      }

      return true
    } catch (error) {
      return false
    }
  }

  async generate(inputs: Uint8Array, circuitId: CircuitId): Promise<ZKProof> {
    const circuitData = await this.circuitStorage.loadCircuitData(circuitId)

    if (!circuitData.wasm) {
      throw new Error(`wasm file doesn't exist for circuit ${circuitId}`)
    }

    return prove(
      inputs,
      circuitData.provingKey as Uint8Array,
      circuitData.wasm,
      this.witnessCalculator
    )
  }
}
