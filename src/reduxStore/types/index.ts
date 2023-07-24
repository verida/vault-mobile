import { Reducer as ReduxReducer } from 'redux'

import { rootReducer } from '..'

export type RootState = typeof rootReducer extends ReduxReducer<infer S>
  ? S
  : never
