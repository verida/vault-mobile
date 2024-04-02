import * as React from 'react'

import { useAppSelector } from 'reduxStore/types'

export function useWalletsData() {
  const maybeWalletsData = useAppSelector(
    (state) => state.cryptoWallets.wallets // TODO: Use an existing selector
  )

  return React.useMemo(() => maybeWalletsData || {}, [maybeWalletsData])
}
