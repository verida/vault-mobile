import { ParsedCaipType, stringifyCaip } from 'features/caip'
import * as React from 'react'

import { useActiveWalletConnectSessionChainAccountsCaipTypes } from '../hooks'
import { WalletConnectSessionNamespacesChainId } from './WalletConnect.Session.Namespaces.ChainId'

export const WalletConnectSessionChainCard = React.memo(
  function WalletConnectSessionChainCard({
    walletConnectSessionKey,
    // TODO: Consider branding.
    // HACK: Note here, chain is WalletConnect specific terminology. These are NOT
    //       Verida ChainIds.
    chain,
  }: {
    readonly walletConnectSessionKey: string
    readonly chain: string
  }): JSX.Element {
    // TODO: wtf chain/chains? what is going on
    const { caipTypes } = useActiveWalletConnectSessionChainAccountsCaipTypes({
      chain,
      walletConnectSessionKey,
    })

    return (
      <React.Fragment
        // eslint-disable-next-line react/no-children-prop
        children={caipTypes.map((parsedCaipType: ParsedCaipType) => (
          <WalletConnectSessionNamespacesChainId
            key={stringifyCaip(parsedCaipType)}
            walletConnectSessionKey={walletConnectSessionKey}
            // Yikes.
            chain={chain}
            parsedCaipType={parsedCaipType}
          />
        ))}
      />
    )
  }
)
