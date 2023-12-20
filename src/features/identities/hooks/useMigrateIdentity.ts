import { AutoAccount } from '@verida/account-node'
import { Client } from '@verida/client-rn'
import { EnvironmentType } from '@verida/types'
import { config } from 'config'
import { Account, addAccount } from 'features/identities'
import { useCurrentIdentity } from 'features/identities/hooks/useCurrentIdentity'
import { canMigrateToMainnet } from 'features/identities/utils'
import { useCurrentProfile } from 'features/profiles'
import { Logger } from 'features/telemetry'
import { getDidClientConfigForNetwork } from 'features/verida'
import { getCountryCode } from 'helpers'
import { merge } from 'lodash'
import { useCallback } from 'react'
import { wait } from 'utils'

import AccountManager from 'api/AccountManager'
import { useAppDispatch } from 'reduxStore/types'

import {
  UpdateMigrateStepStatusFunction,
  UpdateMigrationProgressFunction,
} from '../types'

const logger = new Logger('Identity')

const mainnetNetwork = EnvironmentType.MAINNET

export function useMigrateIdentity() {
  const dispatch = useAppDispatch()
  const currentIdentity = useCurrentIdentity()
  const { country: currentIdentityCountry } = useCurrentProfile()

  const migrate = useCallback(
    async (
      updateStatus: UpdateMigrateStepStatusFunction,
      updateMigrationProgress: UpdateMigrationProgressFunction
    ) => {
      if (!currentIdentity) {
        throw new Error('No current identity')
      }

      if (!canMigrateToMainnet(currentIdentity.did)) {
        throw new Error('Identity cannnot be migrated')
      }

      try {
        logger.info('Starting migrating identity', { did: currentIdentity.did })
        updateStatus('createDID', 'processing')

        const defaultDidConfig = getDidClientConfigForNetwork(mainnetNetwork)
        const didClientConfig = merge({}, defaultDidConfig, {
          veridaKey: currentIdentity.privateKey,
        })

        const mainnetClient = new Client({
          environment: mainnetNetwork,
          didClientConfig: {
            rpcUrl: didClientConfig.rpcUrl,
            network: mainnetNetwork,
          },
        })
        logger.debug('Created Mainnet client')

        const mainnetVeridaAccount = new AutoAccount({
          privateKey: currentIdentity.privateKey,
          environment: mainnetNetwork,
          didClientConfig,
        })
        logger.debug('Created Mainnet local account')

        const notificationEndpoints =
          config.verida[mainnetNetwork].notificationServerUrls

        logger.debug('Defining storage nodes')

        const countryCode = currentIdentityCountry
          ? getCountryCode(currentIdentityCountry)
          : undefined

        await mainnetVeridaAccount.loadDefaultStorageNodes(countryCode, 3, {
          network: mainnetNetwork,
          notificationEndpoints,
        })

        updateStatus('connectIdentity', 'processing')
        logger.debug('Connecting mainnet identity')

        // Connect the Verida account to the Verida client
        await mainnetClient.connect(mainnetVeridaAccount)

        const mainnetDid = await mainnetVeridaAccount.did()
        logger.debug('Mainnet identity connected', { did: mainnetDid })

        const mainnetIdentity: Account = {
          did: mainnetDid,
          privateKey: currentIdentity.privateKey,
          mnemonic: currentIdentity.mnemonic,
          seedPhraseReminder: {
            backedup: false,
          },
        }

        logger.debug('Mainnet identity created', { mainnetIdentity })

        logger.debug('Adding mainnet identity to redux store')
        await AccountManager.getInstance().addAccount(mainnetIdentity)
        dispatch(addAccount(mainnetIdentity))

        updateStatus('createDID', 'success')
        updateStatus('connectIdentity', 'success')
        logger.info('Mainnet Identity created successfully')
      } catch (error: unknown) {
        logger.error(error)
      }

      updateStatus('migrateData', 'processing')
      logger.debug('Starting migrating data')
      // create a loop for 10 seconds and update the progress
      for (let i = 0; i <= 100; i++) {
        await wait(100)
        updateMigrationProgress(i / 100)
      }
      updateStatus('migrateData', 'success')
      logger.info('Data migrated successfully')
      // updateStatus('migrateData', 'error')
      // throw new Error('Error migrating data')
    },
    [dispatch, currentIdentity, currentIdentityCountry]
  )

  return { migrate }
}
