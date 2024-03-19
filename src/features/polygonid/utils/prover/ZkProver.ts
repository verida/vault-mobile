import { CircuitId, ICircuitStorage, IZKProver } from '@0xpolygonid/js-sdk'
import { ZKProof } from '@iden3/js-jwz'
import { Logger } from 'features/telemetry'

import { CalculateWitnessFunction } from '../../types'
import { prove } from './prover'
import { verify } from './verifier'

const logger = Logger.create('PolygonId')

export class ZkProver implements IZKProver {
  constructor(
    private readonly circuitStorage: ICircuitStorage,
    public calculateWitness: CalculateWitnessFunction
  ) {
    // nothing
  }

  async verify(zkp: ZKProof, circuitId: CircuitId): Promise<boolean> {
    logger.info('Verifying ZK proof...')

    try {
      logger.debug(`Getting circuit ${circuitId} from circuit storage`)
      const circuitData = await this.circuitStorage.loadCircuitData(circuitId)

      if (!circuitData.verificationKey) {
        throw new Error(
          `Verification file doesn't exist for circuit ${circuitId}`
        )
      }

      logger.debug('Executing verify method on ZK proof...')
      const isValid = await verify(zkp, circuitData.verificationKey)
      logger.debug('Verify method executed successfully')

      return isValid
    } catch (error) {
      logger.error(
        new Error('Error while verifying ZK proof', {
          cause: error,
        })
      )
      // TODO: Should we rethrow?
      return false
    }
  }

  async generate(inputs: Uint8Array, circuitId: CircuitId): Promise<ZKProof> {
    logger.info('Generating ZK proof...')

    try {
      logger.debug(`Getting circuit ${circuitId} from circuit storage`)
      const circuitData = await this.circuitStorage.loadCircuitData(circuitId)

      if (!circuitData.wasm) {
        throw new Error(`Wasm file doesn't exist for circuit ${circuitId}`)
      }

      if (!circuitData.provingKey) {
        throw new Error(
          `Proving key file doesn't exist for circuit ${circuitId}`
        )
      }

      logger.debug('Executing prove method to get proof...')
      const proof = await prove(
        inputs,
        circuitData.provingKey,
        circuitData.wasm,
        this.calculateWitness
      )
      logger.debug('Prove method executed successfully')

      return proof
    } catch (error) {
      logger.warn(
        `Failed to generate ZK proof: ${
          error instanceof Error ? error.message : 'Unknown reason'
        }`
      )
      throw new Error('Failed to generate ZK proof', {
        cause: error,
      })
    }
  }
}
