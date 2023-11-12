import { IDatastore } from '@verida/types'
import { ChainId } from 'caip'
import { ethers } from 'ethers'

import AccountManager from 'api/AccountManager'
import { ShoppingCoupon } from 'api/types'
import { createAppAsyncThunk } from 'reduxStore/types'

import { CAIP_SLICE_NAME, ChainMetadata } from '../@types'

// HACK: For now, we'll save networks as shopping coupons. 🤡
const HACK_SHOPPING_COUPON_DATASTORE =
  'https://common.schemas.verida.io/shopping/coupon/v0.1.0/schema.json'

type AddCustomNetworkParams = {
  readonly addCustomNetworkParams: readonly ChainMetadata[]
  readonly reset?: boolean
}

const chainMetadataToShoppingCoupon = (
  chainMetadata: ChainMetadata
): ShoppingCoupon => {
  const { name: title } = chainMetadata

  const value = JSON.stringify(chainMetadata)

  // TODO: We need a dedicated data model for this kind of information.
  // TODO: The data model would also need to save a caip identifier.
  return {
    title,
    description: 'A custom chain created using the Vault App.',
    value,
    valueType: 'CustomChain',
    currency: 'Crypto',
    barcode: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value)),
  }
}

const shoppingCouponToMaybeChainMetadata = (
  shoppingCoupon: unknown
): ChainMetadata | null => {
  if (!shoppingCoupon || typeof shoppingCoupon !== 'object') return null

  if (!('value' in shoppingCoupon)) return null

  const { value: maybeValue } = shoppingCoupon

  if (typeof maybeValue !== 'string') return null

  let value: unknown = null

  try {
    value = JSON.parse(maybeValue)
  } catch {}

  const maybeParsed = ChainMetadata.safeParse(value)

  if (!maybeParsed.success) return null

  return maybeParsed.data
}

const getCustomNetworkDatastore = (): Promise<IDatastore> => {
  // TODO: @cawfree idk if this is correct
  const vault = AccountManager.getInstance().context

  if (!vault) throw new Error('Unable to allocate vault for custom networks.')

  return vault.openDatastore(HACK_SHOPPING_COUPON_DATASTORE)
}

const loadAllCustomNetworksFromDatastore = async ({
  datastore,
}: {
  readonly datastore: IDatastore
}): Promise<ChainMetadata[]> => {
  // Read *all* the custom networks configurations back.
  const [...results] = await datastore.getMany({}, undefined)

  // Parse into correctly-formatted chains.
  return results.flatMap((result): ChainMetadata[] => {
    const maybeChainMetadata = shoppingCouponToMaybeChainMetadata(result)

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
        // TODO: devex - (any, any) - what do these mean?
        const result = await datastore.save(
          chainMetadataToShoppingCoupon(chainMetadata),
          undefined
        )

        // TODO: devex - is this the correct way to handle results?
        if (
          (typeof result === 'boolean' && !result) ||
          (typeof result === 'object' && 'ok' in result && !result.ok)
        )
          throw new Error('Failed to save custom network!')
      }
    )
  )

  // Finally, read all of the chains back for persistence.
  return loadAllCustomNetworksFromDatastore({
    datastore,
  })
}

export const addCustomNetwork = createAppAsyncThunk(
  `${CAIP_SLICE_NAME}/addCustomNetwork`,
  async (
    { addCustomNetworkParams, reset = false }: AddCustomNetworkParams,
    { rejectWithValue }
  ) => {
    try {
      return batchModifyCustomNetworks({
        networksToAdd: addCustomNetworkParams,
        chainIdsToRemove: [],
        reset,
      })
    } catch (error) {
      return rejectWithValue(`Failed to add custom network. ${String(error)}`)
    }
  }
)

type RemoveCustomNetworkParams = {
  readonly chainIds: readonly ChainId[]
}

export const removeCustomNetwork = createAppAsyncThunk(
  `${CAIP_SLICE_NAME}/removeCustomNetwork`,
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
