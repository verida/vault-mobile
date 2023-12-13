import { Logger } from 'features/telemetry'
import { useCallback } from 'react'
import { wait } from 'utils'

import { UpdateMigrateStepStatusFunction } from '../types'

const logger = new Logger('Identity')

export function useMigrateIdentity() {
  const migrate = useCallback(
    async (did: string, updateStatus: UpdateMigrateStepStatusFunction) => {
      logger.info('Starting migrating identity', { did })
      await wait(500)
      updateStatus('createDID', 'processing')
      logger.debug('Creating Mainnet DID', { did })
      await wait(3000)
      updateStatus('connectIdentity', 'processing')
      logger.debug('Connecting new identity', { did })
      await wait(5000)
      updateStatus('createDID', 'success')
      updateStatus('connectIdentity', 'success')
      logger.info('Mainnet Identity created successfully', { did })
      await wait(500)
      updateStatus('migrateData', 'processing')
      logger.debug('Starting migrating data', { did })
      await wait(10 * 1000)
      updateStatus('migrateData', 'success')
      logger.info('Data migrated successfully', { did })
      // updateStatus('migrateData', 'error')
      // throw new Error('Error migrating data')
    },
    []
  )

  return { migrate }
}
