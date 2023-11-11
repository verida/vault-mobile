import * as React from 'react'

import { CryptoWalletContextCawfreeProvider } from '../contexts'
import { useCreateCryptoWalletBalances } from '../hooks'

export const CryptoWalletCawfreeProvider = React.memo(
  function CryptoWalletCawfreeProvider({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    return (
      <CryptoWalletContextCawfreeProvider
        children={children}
        value={useCreateCryptoWalletBalances()}
      />
    )
  }
)
