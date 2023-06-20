import {
  ActiveSessions,
  MaybeActiveSession,
  useWalletConnectContext,
} from 'features/walletConnect'

export function getMaybeWalletConnectActiveSessionByKey({
  activeSessions,
  walletConnectSessionKey,
}: {
  readonly activeSessions: ActiveSessions
  readonly walletConnectSessionKey: string | undefined
}): MaybeActiveSession {
  if (
    typeof walletConnectSessionKey !== 'string' ||
    !walletConnectSessionKey.length
  )
    return undefined

  return activeSessions?.[walletConnectSessionKey] || undefined
}

export function useActiveWalletConnectSession({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): MaybeActiveSession {
  const { activeSessions } = useWalletConnectContext()

  return getMaybeWalletConnectActiveSessionByKey({
    activeSessions,
    walletConnectSessionKey,
  })
}
