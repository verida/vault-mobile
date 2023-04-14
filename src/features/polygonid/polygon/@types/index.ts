import {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
} from '@0xpolygonid/js-sdk'
import type { AccountNodeDIDClientConfig, EnvironmentType } from '@verida/types'

export interface PolygonIdManagerConfig {
  readonly polygonIdSeed: string
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

export type PolygonVerifyQrCodeProps = {
  readonly managerId: string
  readonly qrCodeString: string
}

export type PolygonVerifyQrCode = (
  props: PolygonVerifyQrCodeProps
) => Promise<string>

export type PolygonHandleFetchProps = {
  readonly managerId: string
  readonly data: CredentialsOfferMessage
}

export type PolygonHandleFetch = (
  props: PolygonHandleFetchProps
) => Promise<string>

export type PolygonHandleAuthRequestProps = {
  readonly managerId: string
  readonly data: AuthorizationRequestMessage
}

export type PolygonHandleAuthRequest = (
  props: PolygonHandleAuthRequestProps
) => Promise<string>

export type RandomKeyGenerator = () => string

export type PolygonContextValue = {
  readonly hanldeFetchRequest: PolygonHandleFetch
  readonly handleAuthRequest: PolygonHandleAuthRequest
  readonly createIdManager: PolygonCreateIdManager
  readonly verifyQrCode: PolygonVerifyQrCode
  readonly loading: boolean
  readonly generateRandomKey: RandomKeyGenerator
}

export type PolygonWebViewCallbackProps = {
  readonly taskId: string
} & (
  | {
      readonly data: unknown
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
