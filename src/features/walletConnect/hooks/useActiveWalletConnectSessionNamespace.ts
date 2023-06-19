import { SessionTypes } from '@walletconnect/types'
import { useActiveWalletConnectSessionNamespaces } from 'features/walletConnect'
import Namespaces = SessionTypes.Namespaces

export function useActiveWalletConnectSessionNamespace({
  walletConnectSessionKey,
  chain,
}: {
  readonly walletConnectSessionKey: string | undefined
  readonly chain: string | undefined
}): Namespaces[string] | undefined {
  const namespaces = useActiveWalletConnectSessionNamespaces({
    walletConnectSessionKey,
  })

  if (!namespaces || !chain) return undefined

  const { [chain]: maybeNamespace } = namespaces

  return maybeNamespace || undefined
}
