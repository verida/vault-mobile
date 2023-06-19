import { ActiveSessions, useWalletConnectContext } from 'features/walletConnect'

export function useActiveWalletConnectSession({
  walletConnectSessionId,
}: {
  readonly walletConnectSessionId?: string
} = {}): ActiveSessions[string] | undefined {
  const { activeSessions } = useWalletConnectContext()

  return activeSessions?.[walletConnectSessionId] || undefined
}
