import * as React from 'react'

import { CryptoWalletContextBalanceProvider } from '../contexts'
import { useCreateCryptoWalletBalances } from '../hooks'

export const CryptoWalletBalanceProvider = React.memo(
  function CryptoWalletBalanceProvider({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    return (
      <CryptoWalletContextBalanceProvider
        children={children}
        value={useCreateCryptoWalletBalances()}
      />
    )
  }
)
