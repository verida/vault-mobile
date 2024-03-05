import { migrateContext as migrateVeridaContext } from '@verida/client-rn'
import { EnvironmentType, IContext } from '@verida/types'
import { config } from 'config'
import { Logger } from 'features/telemetry'

import { UpdateContextMigrationProgressFunction } from '../types'
import { getNetworkFromDID } from './network'

const logger = Logger.create('IdentityMigration')

export function canMigrateToMainnet(did: string) {
  const network = did ? getNetworkFromDID(did) : undefined

  return (
    config.features.veridaMainnet.enableMigration &&
    (network === EnvironmentType.TESTNET || network === EnvironmentType.DEVNET)
  )
  // TODO: Check if the DID already exists on Mainnet, if so we should not allow the migration either
}

type Database = {
  did: string
  contextName: string
  databaseHash: string
  databaseName: string
}

export function migrateContext(
  sourceContext: IContext,
  targetContext: IContext,
  update?: UpdateContextMigrationProgressFunction
) {
  return new Promise<void>((resolve, reject) => {
    const migrationListener = migrateVeridaContext(sourceContext, targetContext)

    migrationListener.on('start', (databases: Database[]) => {
      logger.debug('Starting context migration')
      logger.debug(`Migrating ${databases.length} databases`)
    })

    migrationListener.on(
      'migrated',
      (dbInfo: Database, dbIndex: number, totalDbs: number) => {
        logger.debug(`Migrated ${dbInfo.databaseName} database`)
        logger.debug(`Migrated ${dbIndex} of ${totalDbs} databases`)
        update?.(dbIndex / totalDbs)
      }
    )

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
