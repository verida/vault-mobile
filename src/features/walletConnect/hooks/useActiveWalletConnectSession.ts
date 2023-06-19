import { ActiveSessions, useWalletConnectContext } from 'features/walletConnect'

export function useActiveWalletConnectSession({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): ActiveSessions[string] | undefined {
  const { activeSessions } = useWalletConnectContext()

  if (!walletConnectSessionKey) return undefined

  return activeSessions?.[walletConnectSessionKey] || undefined
}
