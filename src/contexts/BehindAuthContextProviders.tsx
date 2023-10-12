import { CryptoWalletProvider } from 'features/cryptoWallet'
import { PolygonIdProvider } from 'features/polygonid'
import { ProtocolsProvider } from 'features/protocols'
import { VeramoProvider } from 'features/veramo'
import React from 'react'

type BehindAuthContextProvidersProps = {
  children: React.ReactNode
}

/**
 * This component is used to wrap all context providers that should only be available after the user has authenticated.
 */
export const BehindAuthContextProviders: React.FunctionComponent<BehindAuthContextProvidersProps> =
  (props) => {
    const { children } = props

    // TODO: Move other relavant context providers here
    return (
      <CryptoWalletProvider>
        <VeramoProvider>
          <PolygonIdProvider>
            <ProtocolsProvider>{children}</ProtocolsProvider>
          </PolygonIdProvider>
        </VeramoProvider>
      </CryptoWalletProvider>
    )
  }
