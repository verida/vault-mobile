import { createSlice } from '@reduxjs/toolkit'
import { IDatastore } from '@verida/types'

import AccountManager from '~/api/AccountManager'
import { logout } from '~/features/auth'
import { createAppAsyncThunk } from '~/reduxStore/types'

import { CUSTOM_BLOCKCHAIN_SCHEMA_URL } from '../constants'
import {
  AddCustomBlockchainsParams,
  ChainMetadata,
  RemoveCustomBlockchainsParams,
} from '../types'
import { batchModifyCustomNetworks } from '../utils'

export const BLOCKCHAIN_SLICE_NAME = 'blockchains'

// TODO: Move to types folder
export type BlockchainsReduxState = {
  customBlockchains: {
    data: ChainMetadata[]
    status: {
      processing: boolean
      error?: Error
    }
  }
}

const initialState: BlockchainsReduxState = {
  customBlockchains: {
    data: [],
    status: {
      processing: false,
    },
  },
}

export const blockchainSlice = createSlice({
  name: BLOCKCHAIN_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers(builder) {
    // Log out
    builder.addCase(logout, () => initialState)

    // Add custom blockchains
    builder
      .addCase(addCustomBlockchains.pending, (state) => {
        state.customBlockchains.status = {
          processing: true,
          error: undefined,
        }
      })
      .addCase(addCustomBlockchains.fulfilled, (state, action) => {
        state.customBlockchains = {
          data: action.payload,
          status: {
            processing: false,
            error: undefined,
          },
        }
      })
      .addCase(addCustomBlockchains.rejected, (state, action) => {
        state.customBlockchains.status = {
          processing: false,
          error: new Error(action.payload),
        }
      })

    // Remove custom blockchains
    builder
      .addCase(removeCustomBlockchains.pending, (state) => {
        state.customBlockchains.status = {
          processing: true,
          error: undefined,
        }
      })
      .addCase(removeCustomBlockchains.fulfilled, (state, action) => {
        state.customBlockchains = {
          data: action.payload,
          status: {
            processing: false,
            error: undefined,
          },
        }
      })
      .addCase(removeCustomBlockchains.rejected, (state, action) => {
        state.customBlockchains.status = {
          processing: false,
          error: new Error(action.payload),
        }
      })
  },
})

export const addCustomBlockchains = createAppAsyncThunk(
  `${BLOCKCHAIN_SLICE_NAME}/addCustomBlockchains`,
  async (params: AddCustomBlockchainsParams, { rejectWithValue }) => {
    const { blockchains, reset = false } = params

    try {
      const datastore = await getCustomBlockchainsDatastore()

      const result = await batchModifyCustomNetworks({
        networksToAdd: blockchains,
        chainIdsToRemove: [],
        reset,
        datastore,
      })

      return result
    } catch (error) {
      return rejectWithValue(`Failed to add custom blockchains`)
    }
  }
)

export const removeCustomBlockchains = createAppAsyncThunk(
  `${BLOCKCHAIN_SLICE_NAME}/removeCustomBlockchains`,
  async (params: RemoveCustomBlockchainsParams, { rejectWithValue }) => {
    const { chainIds } = params

    try {
      const datastore = await getCustomBlockchainsDatastore()

      return batchModifyCustomNetworks({
        networksToAdd: [],
        chainIdsToRemove: chainIds,
        datastore,
      })
    } catch (error) {
      return rejectWithValue(`Failed to remove custom blockchains`)
    }
  }
)

function getCustomBlockchainsDatastore(): Promise<IDatastore> {
  const vault = AccountManager.getInstance().context

  if (!vault) {
    throw new Error('Unable to allocate vault for custom networks.')
  }

  return vault.openDatastore(CUSTOM_BLOCKCHAIN_SCHEMA_URL)
}
