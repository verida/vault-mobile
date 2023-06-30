import { NearSigningMethod } from 'features/near'
import { NearSessionRequestHandlers } from 'features/walletConnect'
import * as React from 'react'

const stub = async (nearSigningMethod: NearSigningMethod) => {
  throw new Error(`Method stub for "${nearSigningMethod}"!`)
}

export function useSessionRequestHandlersNear(): NearSessionRequestHandlers {
  return React.useMemo<NearSessionRequestHandlers>(
    () => ({
      [NearSigningMethod.NEAR_SIGN_IN]: () =>
        stub(NearSigningMethod.NEAR_SIGN_IN),
      [NearSigningMethod.NEAR_SIGN_OUT]: () =>
        stub(NearSigningMethod.NEAR_SIGN_OUT),
      [NearSigningMethod.NEAR_GET_ACCOUNTS]: () =>
        stub(NearSigningMethod.NEAR_GET_ACCOUNTS),
      [NearSigningMethod.NEAR_SIGN_TRANSACTION]: () =>
        stub(NearSigningMethod.NEAR_SIGN_TRANSACTION),
      [NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION]: () =>
        stub(NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION),
      [NearSigningMethod.NEAR_SIGN_TRANSACTIONS]: () =>
        stub(NearSigningMethod.NEAR_SIGN_TRANSACTIONS),
      [NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS]: () =>
        stub(NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS),
    }),
    []
  )
}
