import {
  useActiveWalletConnectSessionNamespace,
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
    const maybeNamespace = useActiveWalletConnectSessionNamespace({
      walletConnectSessionKey,
      chain,
    })

    const maybeAccounts = React.useMemo(
      () => maybeNamespace?.accounts || [],
      [maybeNamespace]
    )

    // TODO: wtf chain/chains? what is going on
    const chainIds = React.useMemo(
      () => [
        ...new Set(
          maybeAccounts.flatMap((maybeAccount) => {
            if (typeof maybeAccount !== 'string' || !maybeAccount.length)
              return []

            const [maybeType, maybeChain] = maybeAccount.split(':')

            const accountIsInvalid = Boolean(!maybeType || !maybeChain)

            accountIsInvalid &&
              // eslint-disable-next-line no-console
              console.warn(
                `Encountered unsupported account, "${String(maybeAccount)}".`
              )

            if (accountIsInvalid) return []

            // TODO: this is common logic, we should be connecting these areas
            const chainId = `${maybeType}:${maybeChain}`

            return [chainId]
          })
        ),
      ],
      [maybeAccounts]
    )

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
