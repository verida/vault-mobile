import { EthereumSigningMethod } from 'features/ethereum'
import { EthereumSessionRequestHandlers } from 'features/walletConnect'
import * as React from 'react'

const stub = async (signingMethod: EthereumSigningMethod) => {
  throw new Error(
    `Ethereum signing method "${signingMethod}" is not supported!`
  )
}

export function useWalletConnectSessionRequestHandlersEthereumLike(): EthereumSessionRequestHandlers {
  return React.useMemo<EthereumSessionRequestHandlers>(
    () => ({
      [EthereumSigningMethod.WALLET_SWITCH_ETHEREUM_CHAIN]: () =>
        stub(EthereumSigningMethod.WALLET_SWITCH_ETHEREUM_CHAIN),
      [EthereumSigningMethod.PERSONAL_SIGN_TYPED_DATA]: () =>
        stub(EthereumSigningMethod.PERSONAL_SIGN_TYPED_DATA),
      [EthereumSigningMethod.PERSONAL_SIGN]: () =>
        stub(EthereumSigningMethod.PERSONAL_SIGN),
      [EthereumSigningMethod.WALLET_SWITCH_ETHEREUM_CHAIN]: () =>
        stub(EthereumSigningMethod.WALLET_SWITCH_ETHEREUM_CHAIN),
      [EthereumSigningMethod.SIGN_TRANSACTION]: () =>
        stub(EthereumSigningMethod.SIGN_TRANSACTION),
      [EthereumSigningMethod.SEND_TRANSACTION]: () =>
        stub(EthereumSigningMethod.SEND_TRANSACTION),
    }),
    []
  )
}
