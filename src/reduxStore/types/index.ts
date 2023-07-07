import { createAsyncThunk, ThunkAction } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { AnyAction } from 'redux'

import { store } from '..'
import * as actions from '../actions'
import { ExtractActionFromActionCreator } from './base'

// @deprecated: To be removed types
export type AllActions = ExtractActionFromActionCreator<
  typeof actions[keyof typeof actions]
>
export type Reducer<S = any> = (state: S | undefined, action: AllActions) => S
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
// @deprecated types end

// Only keep those types below
export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
}>()
