import { Reducer as ReduxReducer } from 'redux'

import { rootReducer } from '..'
import * as actions from '../actions'
import { ExtractActionFromActionCreator } from './base'

export type AllActions = ExtractActionFromActionCreator<
  typeof actions[keyof typeof actions]
>

export type Reducer<S = any> = (state: S | undefined, action: AllActions) => S

export type RootState = typeof rootReducer extends ReduxReducer<infer S>
  ? S
  : never
