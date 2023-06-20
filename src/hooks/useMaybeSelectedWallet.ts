import { useWalletsData } from 'hooks'
import { VeridaWallet } from 'types'

import { useMaybeSelectedWalletId } from 'hooks/useMaybeSelectedWalletId'

export function useMaybeSelectedWallet(): VeridaWallet | undefined {
  const walletsData = useWalletsData()
  const selectedWalletId = useMaybeSelectedWalletId()

  if (typeof selectedWalletId !== 'string' || !selectedWalletId.length)
    return undefined

  return walletsData?.[selectedWalletId] || undefined
}
