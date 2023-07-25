import * as React from 'react'

import { useAppSelector } from 'reduxStore/types'

export function useWalletsData() {
  const maybeWalletsData = useAppSelector(
    (state) => state.cryptoWallets.walletsData
  )

  return React.useMemo(() => maybeWalletsData || {}, [maybeWalletsData])
}
