import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { RootState } from '~/reduxStore/types'

export interface SettingsState {
  showSeedPhraseReminder: boolean
}

const initialState: SettingsState = {
  showSeedPhraseReminder: false,
}

/**
 * All the app settings and user preferences should be placed here
 * Data will be persisted
 */
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setShowSeedPhraseReminder: (state, action: PayloadAction<boolean>) => {
      state.showSeedPhraseReminder = action.payload
    },
  },
})

// Actions
export const { setShowSeedPhraseReminder } = settingsSlice.actions

// Selectors
export const selectShowSeedPhraseReminder = (state: RootState) =>
  state.settings.showSeedPhraseReminder
