import React from 'react'

import { CryptoWalletProvider } from '~/features/cryptoWallet'
import { InboxProvider } from '~/features/inbox'
import { PolygonIdProvider } from '~/features/polygonid'
import { ProtocolsProvider } from '~/features/protocols'
import { VeramoProvider } from '~/features/veramo'

type BehindAuthContextProvidersProps = {
  children: React.ReactNode
}

/**
 * This component is used to wrap all context providers that should only be available after the user has authenticated.
 */
export const BehindAuthContextProviders: React.FunctionComponent<
  BehindAuthContextProvidersProps
> = (props) => {
  const { children } = props

  // TODO: Move other relavant context providers here
  return (
    <InboxProvider>
      <CryptoWalletProvider>
        <PolygonIdProvider>
          <VeramoProvider>
            <ProtocolsProvider>{children}</ProtocolsProvider>
          </VeramoProvider>
        </PolygonIdProvider>
      </CryptoWalletProvider>
    </InboxProvider>
  )
}
