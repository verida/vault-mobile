import { AutoAccount } from '@verida/account-node'
import { Client } from '@verida/client-rn'
import { StorageLink } from '@verida/storage-link'
import { EnvironmentType } from '@verida/types'
import { config } from 'config'
import {
  fetchAllPublicProfilesData,
  useCurrentProfile,
} from 'features/profiles'
import { Logger } from 'features/telemetry'
import { getDidClientConfigForNetwork } from 'features/verida'
import { getCountryCode } from 'helpers'
import { merge } from 'lodash'
import { useCallback } from 'react'

import AccountManager from 'api/AccountManager'
import { useAppDispatch } from 'reduxStore/types'

import {
  IDENTITY_MIGRATION_PREDEFINED_CONTEXT_NAMES,
  IDENTITY_MIGRATION_USE_PREDEFINED_CONTEXTS,
} from '../constants'
import { addAccount } from '../slice'
import {
  Account,
  UpdateMigrateStepStatusFunction,
  UpdateMigrationProgressFunction,
} from '../types'
import { canMigrateToMainnet, migrateContext } from '../utils'
import { useCurrentIdentity } from './useCurrentIdentity'

const logger = new Logger('IdentityMigration')

const mainnetNetwork = EnvironmentType.MAINNET

export function useMigrateIdentity() {
  const dispatch = useAppDispatch()
  const currentIdentity = useCurrentIdentity()
  const { country: currentIdentityCountry } = useCurrentProfile()

  // TODO: Once working, break down the big functions in smaller ones
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

      // Prepare Mainnet Identity

      let mainnetClient: Client
      let mainnetVeridaAccount: AutoAccount
      let mainnetDid: string
      try {
        logger.info('Starting migrating identity', { did: currentIdentity.did })
        updateStatus('createDID', 'processing')

        const defaultDidConfig = getDidClientConfigForNetwork(mainnetNetwork)
        const didClientConfig = merge({}, defaultDidConfig, {
          veridaKey: currentIdentity.privateKey,
        })

        mainnetClient = new Client({
          environment: mainnetNetwork,
          didClientConfig: {
            rpcUrl: didClientConfig.rpcUrl,
            network: mainnetNetwork,
          },
        })
        logger.debug('Created Mainnet client')

        mainnetVeridaAccount = new AutoAccount({
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
      } catch (error: unknown) {
        updateStatus('createDID', 'error')
        throw new Error('Could not prepare the mainnet identity', {
          cause: error,
        })
      }

      // Connect Mainnet Identity

      try {
        updateStatus('connectIdentity', 'processing')
        logger.debug('Connecting mainnet identity')

        await mainnetClient.connect(mainnetVeridaAccount)
        logger.debug('Mainnet identity connected')
      } catch (error: unknown) {
        updateStatus('createDID', 'error')
        updateStatus('connectIdentity', 'error')
        throw new Error('Could not connect the mainnet identity', {
          cause: error,
        })
      }

      // Add new Identity to App state

      try {
        mainnetDid = await mainnetVeridaAccount.did()

        const mainnetIdentity: Account = {
          did: mainnetDid,
          privateKey: currentIdentity.privateKey,
          mnemonic: currentIdentity.mnemonic,
          seedPhraseReminder: {
            backedup: false,
          },
        }

        logger.debug(
          'Adding mainnet identity to list of accounts in AccountManager'
        )
        await AccountManager.getInstance().addAccount(mainnetIdentity)

        logger.debug('Adding mainnet identity to redux store')
        dispatch(addAccount(mainnetIdentity))
      } catch (error: unknown) {
        updateStatus('createDID', 'error')
        updateStatus('connectIdentity', 'error')
        throw new Error('Could not create mainnet identity', { cause: error })
      }

      updateStatus('createDID', 'success')
      updateStatus('connectIdentity', 'success')
      logger.info('Mainnet Identity created successfully')

      // Migrate Contexts

      try {
        updateStatus('migrateData', 'processing')
        logger.debug('Starting migrating data')

        const currentClient = AccountManager.getInstance().getClient()
        if (!currentClient) {
          throw new Error('No current client')
        }

        // Get storage links (aka contexts) from the current DID document
        const links = await StorageLink.getLinks(
          currentClient.didClient,
          currentIdentity.did
        )

        // Get the hashes of the contexts
        const contextNames = IDENTITY_MIGRATION_USE_PREDEFINED_CONTEXTS
          ? IDENTITY_MIGRATION_PREDEFINED_CONTEXT_NAMES
          : await Promise.all(
              links.map(async (link) => {
                return currentClient.getContextNameFromHash(link.id)
              })
            )
        logger.debug('Context names', { contextNames })

        const nbContextsToMigrate = contextNames.length
        logger.debug(`Number of contexts to migrate ${nbContextsToMigrate}`)

        // TODO: Try optimise by running them in parallel, test if supported by the migration. Sequential is actual easier for the progress.
        for (let i = 0; i < contextNames.length; i++) {
          const contextHash = contextNames[i]
          try {
            const [sourceContext, targetContext] = await Promise.all([
              currentClient.openContext(contextHash, false),
              mainnetClient.openContext(contextHash, true),
            ])

            if (!sourceContext) {
              throw new Error('Could not open source context')
            }
            logger.debug('Source context opened', { contextHash })

            if (!targetContext) {
              throw new Error('Could not open target context')
            }
            logger.debug('Target context opened', { contextHash })

            logger.debug('Migrating context', { contextHash })
            await migrateContext(sourceContext, targetContext, (progress) => {
              updateMigrationProgress((i + progress) / nbContextsToMigrate)
            })
            logger.debug('Context migrated', { contextHash })
          } catch (error: unknown) {
            if (
              error instanceof Error &&
              error.message.match('Unable to locate requested storage context')
            ) {
              updateMigrationProgress((i + 1) / nbContextsToMigrate)
              continue
            }
            logger.error(error) // TODO: After debugging, remove it and let it be reported at a upper level
            throw new Error('Could not migrate context', { cause: error })
          }
        }

        logger.debug('All contexts migrated')
      } catch (error: unknown) {
        updateStatus('migrateData', 'error')
        throw new Error('Could not migrate data', { cause: error })
      }

      updateStatus('migrateData', 'success')
      logger.info('Data migrated successfully')
      dispatch(fetchAllPublicProfilesData())

      return mainnetDid
    },
    [dispatch, currentIdentity, currentIdentityCountry]
  )

  return { migrate }
}
