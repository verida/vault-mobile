import { AutoAccount } from '@verida/account-node'
import { Client } from '@verida/client-rn'
import { StorageLink } from '@verida/storage-link'
import { BlockchainAnchor, IContext, Network } from '@verida/types'
import { merge } from 'lodash'
import { useCallback } from 'react'

import AccountManager from '~/api/AccountManager'
import { config } from '~/config'
import {
  fetchAllPublicProfilesData,
  useCurrentProfile,
} from '~/features/profiles'
import { Logger } from '~/features/telemetry'
import { getDidClientConfigForNetwork } from '~/features/verida'
import { getCountryCode } from '~/helpers'
import { useAppDispatch } from '~/reduxStore/types'

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

const logger = Logger.create('IdentityMigration')

const mainnetNetwork = Network.MYRTLE

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
          network: mainnetNetwork,
          didClientConfig: {
            rpcUrl: didClientConfig.rpcUrl,
            blockchain: BlockchainAnchor.POLPOS,
          },
        })
        logger.debug('Created Mainnet client')

        mainnetVeridaAccount = new AutoAccount({
          privateKey: currentIdentity.privateKey,
          network: mainnetNetwork,
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

      let currentClient: Client | undefined
      try {
        updateStatus('migrateData', 'processing')
        logger.debug('Starting migrating data')

        currentClient = AccountManager.getInstance().getClient()
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
              links
                .filter((link) => !!link)
                .map(async (link) => {
                  return currentClient!.getContextNameFromHash(link.id)
                })
            )

        const cleanedContextNames = contextNames.filter(
          (contextName) => !!contextName
        )
        logger.debug('Context names', { contextNames: cleanedContextNames })

        const contexts: {
          name: string
          source: IContext
          target: IContext
        }[] = []

        // Have to open the context in sequence to avoid conflict when writing them in the DID Document.
        for (let i = 0; i < cleanedContextNames.length; i++) {
          const contextName = cleanedContextNames[i]
          const [sourceContext, targetContext] = await Promise.all([
            currentClient!.openContext(contextName, false),
            mainnetClient.openContext(contextName, true),
          ])

          if (!sourceContext) {
            throw new Error('Could not open source context')
          }
          logger.debug('Source context opened', { contextName })

          if (!targetContext) {
            throw new Error('Could not open target context')
          }
          logger.debug('Target context opened', { contextName })

          contexts.push({
            name: contextName,
            source: sourceContext,
            target: targetContext,
          })
        }

        const nbContextsToMigrate = contexts.length
        logger.debug(`Number of contexts to migrate ${nbContextsToMigrate}`)

        const progressByContext = new Map<string, number>()

        const updateProgressByContext = (context: string, progress: number) => {
          logger.debug(`progress for ${context}: ${progress}`)
          // Update the progress map
          progressByContext.set(context, progress)

          // Calculate the aggregated progress
          let totalProgress = 0
          for (const progressForContext of progressByContext.values()) {
            totalProgress += progressForContext
          }
          const aggregatedProgress = totalProgress / nbContextsToMigrate

          logger.debug(`Aggregated progress: ${aggregatedProgress}`)
          updateMigrationProgress(aggregatedProgress)
        }

        // Run the actual migration of databases in parallel
        await Promise.allSettled(
          contexts.map(async ({ name: contextName, source, target }) => {
            try {
              logger.debug('Migrating context', { contextName })
              await migrateContext(source, target, (progress) => {
                updateProgressByContext(contextName, progress)
              })
              logger.debug('Context migrated', { contextName })
            } catch (error: unknown) {
              if (
                error instanceof Error &&
                error.message.match(
                  'Unable to locate requested storage context'
                )
              ) {
                updateProgressByContext(contextName, 1)
                return
              }
              throw new Error('Could not migrate context', { cause: error })
            }
          })
        )

        logger.debug('All contexts migrated')
      } catch (error: unknown) {
        updateStatus('migrateData', 'error')
        throw new Error('Could not migrate data', { cause: error })
      }

      updateStatus('migrateData', 'success')
      logger.info('Data migrated successfully')
      dispatch(fetchAllPublicProfilesData())

      if (config.features.veridaMainnet.enableDeletionAfterMigration) {
        try {
          updateStatus('deleteIdentity', 'processing')
          logger.info('Deleting current Identity')

          await currentClient.destroyAccount()

          updateStatus('deleteIdentity', 'success')
          logger.info('Current Identity deleted successfully')
        } catch (error: unknown) {
          updateStatus('deleteIdentity', 'error')
          throw new Error('Could not delete migrated identity', {
            cause: error,
          })
        }
      } else {
        logger.info('Skipping current Identity deletion')
      }

      return mainnetDid
    },
    [dispatch, currentIdentity, currentIdentityCountry]
  )

  return { migrate }
}
