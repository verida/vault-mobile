import { ActiveSessions, useWalletConnectContext } from 'features/walletConnect'

export function useActiveWalletConnectSession({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey?: string
} = {}): ActiveSessions[string] | undefined {
  const { activeSessions } = useWalletConnectContext()

  return activeSessions?.[walletConnectSessionKey] || undefined
}
