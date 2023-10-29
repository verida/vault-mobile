import * as React from 'react'

import { CryptoWalletContextProvider } from '../contexts'
import { useCreateCryptoWalletBalances } from '../hooks'

export const CryptoWalletProvider = React.memo(function CryptoWalletProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  return (
    <CryptoWalletContextProvider
      children={children}
      value={useCreateCryptoWalletBalances()}
    />
  )
})
