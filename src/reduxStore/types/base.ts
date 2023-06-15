import { Action as ReduxAction } from 'redux'

export interface Action<T extends string, P> extends ReduxAction<T> {
  payload: P
}

export interface ActionWithError<
  T extends string,
  P,
  E extends Record<string, any>
> extends Action<T, P> {
  payload: P
  error: E
}
