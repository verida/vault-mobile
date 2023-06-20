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
    const { veridaChainIds } =
      useActiveWalletConnectSessionChainAccountsVeridaChainIds({
        chain,
        walletConnectSessionKey,
      })

    return (
      <React.Fragment
        // eslint-disable-next-line react/no-children-prop
        children={veridaChainIds.map((veridaChainId: string) => (
          <WalletConnectSessionNamespacesChainId
            key={veridaChainId}
            walletConnectSessionKey={walletConnectSessionKey}
            // Yikes.
            chain={chain}
            veridaChainId={veridaChainId}
          />
        ))}
      />
    )
  }
)
