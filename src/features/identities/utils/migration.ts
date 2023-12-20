import { migrateContext as migrateVeridaContext } from '@verida/client-rn'
import { EnvironmentType, IContext } from '@verida/types'
import { Logger } from 'features/telemetry'

import { UpdateContextMigrationProgressFunction } from '../types'
import { getNetworkFromDID } from './network'

const logger = new Logger('IdentityMigration')

export function canMigrateToMainnet(did: string) {
  const network = did ? getNetworkFromDID(did) : undefined

  return network === EnvironmentType.TESTNET
  // TODO: Check if the DID already exists on Mainnet, if so we should not allow the migration either
}

export function migrateContext(
  sourceContext: IContext,
  targetContext: IContext,
  update?: UpdateContextMigrationProgressFunction
) {
  return new Promise<void>((resolve, reject) => {
    const migrationListener = migrateVeridaContext(sourceContext, targetContext)

    migrationListener.on('start', (databases: any) => {
      logger.debug('Starting context migration', { databases })
    })

    migrationListener.on('migrated', (_, dbIndex, totalDbs) => {
      logger.debug(`Migrated ${dbIndex} of ${totalDbs} databases`)
      update?.(dbIndex / totalDbs)
    })

    migrationListener.on('complete', () => {
      logger.debug('Context migration complete')
      resolve()
    })

    migrationListener.on('error', (error: unknown) => {
      logger.error(new Error('Error migrating context'))
      logger.error(error)
      reject(error)
    })
  })
}
