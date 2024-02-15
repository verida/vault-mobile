import { CryptoWalletProvider } from 'features/cryptoWallet'
import { NewPolygonIdProvider } from 'features/polygonid_new'
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
        <NewPolygonIdProvider>
          <VeramoProvider>
            <ProtocolsProvider>{children}</ProtocolsProvider>
          </VeramoProvider>
        </NewPolygonIdProvider>
      </CryptoWalletProvider>
    )
  }
