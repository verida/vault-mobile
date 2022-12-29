import { ThunkAction } from '@reduxjs/toolkit'
import { AnyAction, Reducer as ReduxReducer } from 'redux'

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

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>

export interface ReduxError extends Partial<Error> {
  code?: number
  message?: string
}
