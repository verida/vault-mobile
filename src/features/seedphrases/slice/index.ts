import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { RootState } from 'reduxStore/types'

export interface SeedphrasesState {
  template: number[]
}

const initialState: SeedphrasesState = {
  template: [],
}

export const seedphrasesSlice = createSlice({
  name: 'seedphrases',
  initialState,
  reducers: {
    addWord: (state, action: PayloadAction<number>) => {
      if (!state.template.includes(action.payload)) {
        state.template = [...state.template, action.payload]
      }
    },
    removeWord: (state, action: PayloadAction<number>) => {
      state.template = state.template.filter((item) => item !== action.payload)
    },
    resetPhrase: (state) => {
      state.template = []
    },
  },
})

// Actions
export const { addWord, removeWord, resetPhrase } = seedphrasesSlice.actions

// Selectors
export const selectSeedPhraseTemplate = (state: RootState) =>
  state.seedPhrases.template
