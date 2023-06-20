import {
  useActiveWalletConnectSessionChainAccountsVeridaChainIds,
  WalletConnectSessionNamespacesChainId,
} from 'features/walletConnect'
import * as React from 'react'

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
    const chainIds = useActiveWalletConnectSessionChainAccountsVeridaChainIds({
      chain,
      walletConnectSessionKey,
    })

    return (
      <React.Fragment
        // eslint-disable-next-line react/no-children-prop
        children={chainIds.map((chainId: string) => (
          <WalletConnectSessionNamespacesChainId
            key={chainId}
            walletConnectSessionKey={walletConnectSessionKey}
            // Yikes.
            chain={chain}
            chainId={chainId}
          />
        ))}
      />
    )
  }
)
