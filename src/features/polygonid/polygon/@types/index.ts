import type {
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  CredentialsOfferMessage,
  W3CCredential,
} from '@0xpolygonid/js-sdk'
import type { AccountNodeDIDClientConfig, EnvironmentType } from '@verida/types'

export interface PolygonIdManagerConfig {
  readonly polygonIdPrivateKey: string
  readonly veridaPrivateKey: string
  readonly environment: EnvironmentType
  readonly contextName: string
  readonly didClientConfig: AccountNodeDIDClientConfig
}

// Creates a PolygonIdManager on the web context.
// Returns a unique identifier for the manager.
export type PolygonCreateIdManager = (
  config: PolygonIdManagerConfig
) => Promise<string>

export type PolygonHandleCredentialsOfferArgs = {
  readonly managerId: string
  readonly data: CredentialsOfferMessage
}

export type PolygonHandleCredentialsOffer = (
  args: PolygonHandleCredentialsOfferArgs
) => Promise<W3CCredential[]>

export type PolygonHandleAuthorizationRequestArgs = {
  readonly managerId: string
  readonly data: AuthorizationRequestMessage
}

export type PolygonHandleAuthorizationRequest = (
  args: PolygonHandleAuthorizationRequestArgs
) => Promise<{
  callbackResponse: any
  authResponse: AuthorizationResponseMessage
}>

export type RandomKeyGenerator = () => string

export type PolygonContextValue = {
  readonly loading: boolean
  readonly generateRandomKey: RandomKeyGenerator
  readonly createIdManager: PolygonCreateIdManager
  readonly handleAuthorizationRequest: PolygonHandleAuthorizationRequest
  readonly handleCredentialsOffer: PolygonHandleCredentialsOffer
}

export type PolygonWebViewCallbackProps = {
  readonly taskId: string
} & (
  | {
      readonly result: unknown
    }
  | {
      readonly error: Error
    }
)

export type PromiseCallback<T> = {
  readonly resolve: (result: T) => void
  readonly reject: (error: Error) => void
}

// Defines the mapping between a requestId and the equivalent Promise object.
export type PolygonPromiseCallbacks = Record<string, PromiseCallback<unknown>>
