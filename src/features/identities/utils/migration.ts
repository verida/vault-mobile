import { migrateContext as migrateVeridaContext } from '@verida/client-rn'
import { EnvironmentType, IContext } from '@verida/types'

import { UpdateContextMigrationProgressFunction } from '../types'
import { getNetworkFromDID } from './network'

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

    migrationListener.on('migrated', (_, dbIndex, totalDbs) => {
      update?.(dbIndex / totalDbs)
    })

    migrationListener.on('complete', () => {
      resolve()
    })

    migrationListener.on('error', (error: unknown) => {
      reject(error)
    })
  })
}
