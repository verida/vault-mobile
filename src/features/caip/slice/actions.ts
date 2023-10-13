import { ethers } from 'ethers'
import {
  AddEthereumChainRequestParam,
  AddEthereumChainRequestParams,
} from 'features/blockchain/eip155'

import AccountManager from 'api/AccountManager'
import { createAppAsyncThunk } from 'reduxStore/types'

import { CAIP_SLICE_NAME, ChainMetadata, CustomNetwork } from '../@types'

// HACK: For now, we'll save networks as shopping coupons. 🤡
const HACK_SHOPPING_COUPON_DATASTORE =
  'https://common.schemas.verida.io/shopping/coupon/v0.1.0/schema.json'

type Params = {
  readonly addEthereumChainRequestParams: AddEthereumChainRequestParams
  readonly reset?: boolean
}

export const addCustomEthereumNetwork = createAppAsyncThunk(
  `${CAIP_SLICE_NAME}/addCustomEthereumNetwork`,
  async (
    { addEthereumChainRequestParams, reset = true }: Params,
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
      for (const addEthereumChainRequestParam of addEthereumChainRequestParams) {
        const { chainName, nativeCurrency } = addEthereumChainRequestParam
        const value = JSON.stringify(addEthereumChainRequestParam)

        const chainToAddAsShoppingCoupon: CustomNetwork = {
          title: chainName,
          description: 'A custom chain created using the Vault App.',
          value,
          valueType: 'CustomChain',
          currency: nativeCurrency.name,
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

      // Read all the networks back.
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

        const maybeParsed = AddEthereumChainRequestParam.safeParse(value)

        if (!maybeParsed.success) return []

        const {
          data: {
            chainId,
            chainName,
            rpcUrls: [rpc],
          },
        } = maybeParsed

        const customChainMetadata: ChainMetadata = {
          name: chainName,
          // HACK: Notice this is `addEthereumNetwork`!
          namespace: 'eip155',
          reference: String(Number.parseInt(chainId, 16)),
          rpc,
        }

        return [customChainMetadata]
      })
    } catch (error) {
      return rejectWithValue(`Failed to add custom network. ${String(error)}`)
    }
  }
)
