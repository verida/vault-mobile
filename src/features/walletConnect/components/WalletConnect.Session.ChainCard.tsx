import { ChainId } from 'caip'
import * as React from 'react'

import { useActiveWalletConnectSessionChainAccountsCaipChainIds } from '../hooks'
import { WalletConnectSessionNamespacesChainId } from './WalletConnect.Session.Namespaces.ChainId'

export const WalletConnectSessionChainCard = React.memo(
  function WalletConnectSessionChainCard({
    walletConnectSessionKey,
    // TODO: Consider branding: https://dev.to/hateablestream/typescript-tip-safer-functions-with-branded-types-14o4
    chain,
  }: {
    readonly walletConnectSessionKey: string
    readonly chain: string
  }): JSX.Element {
    const { caipChainIds } =
      useActiveWalletConnectSessionChainAccountsCaipChainIds({
        chain,
        walletConnectSessionKey,
      })

    return (
      <React.Fragment
        children={caipChainIds.map((caipChainId: ChainId) => (
          <WalletConnectSessionNamespacesChainId
            key={caipChainId.toString()}
            walletConnectSessionKey={walletConnectSessionKey}
            caipChainId={caipChainId}
          />
        ))}
      />
    )
  }
)
