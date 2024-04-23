import { MaybeNamespace, Namespaces } from '../types'
import { useActiveWalletConnectSessionNamespaces } from './useActiveWalletConnectSessionNamespaces'

export const getNamespaceForChain = ({
  chain,
  namespaces,
}: {
  readonly chain: string | undefined
  readonly namespaces: Namespaces | undefined
}): MaybeNamespace => {
  if (!namespaces || !chain) return undefined

  const { [chain]: maybeNamespace } = namespaces

  return maybeNamespace || undefined
}

export function useActiveWalletConnectSessionNamespace({
  walletConnectSessionKey,
  chain,
}: {
  readonly walletConnectSessionKey: string | undefined
  readonly chain: string | undefined
}): MaybeNamespace {
  const namespaces = useActiveWalletConnectSessionNamespaces({
    walletConnectSessionKey,
  })

  return getNamespaceForChain({ chain, namespaces })
}
