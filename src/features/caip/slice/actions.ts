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

export const addCustomNetwork = createAppAsyncThunk(
  `${CAIP_SLICE_NAME}/addCustomNetwork`,
  async (
    { addCustomNetworkParams, reset = false }: AddCustomNetworkParams,
    { rejectWithValue }
  ) => {
    try {
      // TODO: @cawfree idk if this is correct
      const vault = AccountManager.getInstance().context

      if (!vault)
        throw new Error('Unable to allocate vault for custom networks.')

      const datastore = await vault.openDatastore(
        HACK_SHOPPING_COUPON_DATASTORE
      )

      if (reset) await datastore.deleteAll()

      // TODO: parallelize
      for (const addCustomNetworkParam of addCustomNetworkParams) {
        const { name: title } = addCustomNetworkParam

        const value = JSON.stringify(addCustomNetworkParam)

        // TODO: We need a dedicated data model for this kind of information.
        // TODO: The data model would also need to save a caip identifier.
        const chainToAddAsShoppingCoupon: ShoppingCoupon = {
          title,
          description: 'A custom chain created using the Vault App.',
          value,
          valueType: 'CustomChain',
          currency: 'Crypto',
          barcode: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value)),
        }

        // TODO: devex - (any, any) - what do these mean?
        const result = await datastore.save(
          chainToAddAsShoppingCoupon,
          undefined
        )

        // TODO: devex - is this the correct way to handle results?
        if (
          (typeof result === 'boolean' && !result) ||
          (typeof result === 'object' && 'ok' in result && !result.ok)
        )
          throw new Error('Failed to save custom network!')
      }

      // Read *all* the custom networks configurations back.
      const [...results] = await datastore.getMany({}, undefined)

      // Parse into correctly-formatted chains.
      return results.flatMap((result): ChainMetadata[] => {
        if (!result || typeof result !== 'object') return []

        if (!('value' in result)) return []

        const { value: maybeValue } = result

        if (typeof maybeValue !== 'string') return []

        let value: unknown = null

        try {
          value = JSON.parse(maybeValue)
        } catch {}

        const maybeParsed = ChainMetadata.safeParse(value)

        if (!maybeParsed.success) return []

        // NOTE: Each individual RPC endpoint can be modelled as a dedicated ChainMetadata.
        //       This coincides with the property that a ChainMetadatas can contain duplicate
        //       configurations for the same network - ideally, it would be up to the user to
        //       decide which RPC makes sense for which context; i.e. avoiding frontrunning
        //       when transacting via Flashbots Protect, or using a home node.
        return [maybeParsed.data]
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
  async (
    { chainIds }: RemoveCustomNetworkParams,
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState()

      const {
        customNetworks: { result },
      } = state.caip

      const chainIdsToDelete = chainIds.map((e) => e.toString())

      const chainsThatSurvivedDeletion = result.filter(
        ({ namespace, reference }) =>
          !chainIdsToDelete.includes(
            new ChainId({ namespace, reference }).toString()
          )
      )

      // TODO: edit the state here

      return chainsThatSurvivedDeletion
    } catch (error) {
      return rejectWithValue(
        `Failed to remove custom network. ${String(error)}`
      )
    }
  }
)
