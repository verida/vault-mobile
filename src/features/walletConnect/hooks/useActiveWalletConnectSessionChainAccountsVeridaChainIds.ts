import { useActiveWalletConnectSessionChainAccounts } from 'features/walletConnect'
import * as React from 'react'

export function useActiveWalletConnectSessionChainAccountsVeridaChainIds({
  chain,
  walletConnectSessionKey,
}: {
  readonly chain: string
  readonly walletConnectSessionKey: string
}) {
  const accounts = useActiveWalletConnectSessionChainAccounts({
    chain,
    walletConnectSessionKey,
  })

  return React.useMemo(
    // TODO: Make this reusable, we likely do this in a lot of places
    () => [
      ...new Set(
        accounts.flatMap((maybeAccount) => {
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
    [accounts]
  )
}
