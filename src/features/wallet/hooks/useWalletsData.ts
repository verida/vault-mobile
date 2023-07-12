import * as React from 'react'
import { useSelector } from 'react-redux'
import { VeridaWallet } from 'types'

import { RootState } from 'reduxStore/types'

export function useWalletsData() {
  const maybeWalletsData = useSelector<RootState, Record<string, VeridaWallet>>(
    // @ts-expect-error Redux is untyped.
    (state) => state?.main?.wallets?.data
  )

  return React.useMemo(() => maybeWalletsData || {}, [maybeWalletsData])
}
