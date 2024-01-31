import { IDatastore } from '@verida/types'
import { ChainId } from 'caip'

import AccountManager from 'api/AccountManager'
import { createAppAsyncThunk } from 'reduxStore/types'

import {
  BLOCKCHAIN_SLICE_NAME,
  ChainMetadata,
  CustomBlockchainNetwork,
} from '../@types'
import { CUSTOM_BLOCKCHAIN_SCHEMA_URL } from '../constants'
import {
  chainMetadataToMaybeCustomBlockchainNetwork,
  customBlockchainNetworkToMaybeChainMetadata,
} from '../utils'

type AddCustomNetworkParams = {
  readonly addCustomNetworkParams: readonly ChainMetadata[]
  readonly reset?: boolean
}

const getCustomNetworkDatastore = (): Promise<IDatastore> => {
  const vault = AccountManager.getInstance().context

  if (!vault) throw new Error('Unable to allocate vault for custom networks.')

  return vault.openDatastore(CUSTOM_BLOCKCHAIN_SCHEMA_URL)
}

const loadAllCustomNetworksFromDatastore = async ({
  datastore,
}: {
  readonly datastore: IDatastore
}): Promise<ChainMetadata[]> => {
  // Read *all* the custom networks configurations back.
  const [...results] = await datastore.getMany<CustomBlockchainNetwork>(
    {},
    undefined
  )

  // Parse into correctly-formatted chains.
  return results.flatMap((result): ChainMetadata[] => {
    const maybeChainMetadata = customBlockchainNetworkToMaybeChainMetadata({
      customBlockchainNetwork: result,
    })

    if (!maybeChainMetadata) return []

    // NOTE: Each individual RPC endpoint can be modelled as a dedicated ChainMetadata.
    //       This coincides with the property that a ChainMetadatas can contain duplicate
    //       configurations for the same network - ideally, it would be up to the user to
    //       decide which RPC makes sense for which context; i.e. avoiding frontrunning
    //       when transacting via Flashbots Protect, or using a home node.
    return [maybeChainMetadata]
  })
}

const batchModifyCustomNetworks = async ({
  reset = false,
  networksToAdd,
  chainIdsToRemove,
}: {
  readonly networksToAdd: readonly ChainMetadata[]
  readonly chainIdsToRemove: readonly ChainId[]
  readonly reset?: boolean
}) => {
  const datastore = await getCustomNetworkDatastore()

  // Conditionally reset the datastore, useful for development.
  if (reset) await datastore.deleteAll()

  // Get the existing networks.
  const existingNetworks = await loadAllCustomNetworksFromDatastore({
    datastore,
  })

  // Compute the next networks. Notice the priority: networks
  // to add take higher order of precedence when it comes to
  // de-duping.
  const nextNetworks = [...networksToAdd, ...existingNetworks]

  const nextNetworkChainIds = nextNetworks.map((e) => new ChainId(e).toString())

  const nextNextworksWithoutDuplicates = nextNetworks.filter(
    (_, i) => nextNetworkChainIds.indexOf(nextNetworkChainIds[i]) === i
  )

  const nextChainIdsToRemove = chainIdsToRemove.map((e) =>
    new ChainId(e).toString()
  )

  // Finally, remove any networks which have identifiers which match chainIdsToRemove.
  const nextNetworksWithoutChainsToRemove =
    nextNextworksWithoutDuplicates.filter(
      (e) => !nextChainIdsToRemove.includes(new ChainId(e).toString())
    )

  // Finally, let's save the new networks.
  await datastore.deleteAll()

  await Promise.all(
    nextNetworksWithoutChainsToRemove.map(
      async (chainMetadata: ChainMetadata) => {
        const maybeCustomBlockchainNetwork =
          chainMetadataToMaybeCustomBlockchainNetwork({ chainMetadata })

        if (!maybeCustomBlockchainNetwork)
          throw new Error(
            `Was unable to convert ChainMetadata to CustomBlockchainNetwork!`
          )

        // TODO: devex - (any, any) - what do these mean?
        const result = await datastore.save(
          maybeCustomBlockchainNetwork,
          undefined
        )

        // TODO: devex - is this the correct way to handle results?
        if (
          (typeof result === 'boolean' && !result) ||
          (typeof result === 'object' && 'ok' in result && !result.ok)
        )
          throw new Error(
            `Failed to save custom network! ${JSON.stringify({
              maybeCustomBlockchainNetwork,
              result,
            })}`
          )
      }
    )
  )

  // Finally, read all of the chains back for persistence.
  return loadAllCustomNetworksFromDatastore({
    datastore,
  })
}

export const addCustomNetwork = createAppAsyncThunk(
  `${BLOCKCHAIN_SLICE_NAME}/addCustomNetwork`,
  async (
    { addCustomNetworkParams, reset = false }: AddCustomNetworkParams,
    { rejectWithValue }
  ) => {
    try {
      const result = await batchModifyCustomNetworks({
        networksToAdd: addCustomNetworkParams,
        chainIdsToRemove: [],
        reset,
      })

      return result
    } catch (error) {
      return rejectWithValue(`Failed to add custom network. ${String(error)}`)
    }
  }
)

type RemoveCustomNetworkParams = {
  readonly chainIds: readonly ChainId[]
}

export const removeCustomNetwork = createAppAsyncThunk(
  `${BLOCKCHAIN_SLICE_NAME}/removeCustomNetwork`,
  async ({ chainIds }: RemoveCustomNetworkParams, { rejectWithValue }) => {
    try {
      return batchModifyCustomNetworks({
        networksToAdd: [],
        chainIdsToRemove: chainIds,
      })
    } catch (error) {
      return rejectWithValue(
        `Failed to remove custom network. ${String(error)}`
      )
    }
  }
)
