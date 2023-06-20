import { useActiveWalletConnectSession } from 'features/walletConnect'

export function useActiveWalletConnectSessionPeerId({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): string | undefined {
  const maybeActiveSession = useActiveWalletConnectSession({
    walletConnectSessionKey,
  })

  return maybeActiveSession?.peer?.publicKey
}
