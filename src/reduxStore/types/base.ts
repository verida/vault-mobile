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

export type ExtractPayloadFromActionCreator<AC> = AC extends () => any
  ? void
  : AC extends (payload: infer P) => any
  ? P
  : never

export type ExtractActionFromActionCreator<AC> = AC extends () => infer A
  ? A
  : AC extends (payload: any) => infer A
  ? A
  : AC extends (payload: any, error: any) => infer A
  ? A
  : never
