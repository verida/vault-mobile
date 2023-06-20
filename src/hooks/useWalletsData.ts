import * as React from 'react'
import { useSelector } from 'react-redux'
import { VeridaWallet } from 'types'

import { RootState } from 'reduxStore/types'

export function useWalletsData() {
  // TODO: what is data?
  // @ts-expect-error Redux is untyped.
  const maybeWalletsData = useSelector<RootState, Record<string, VeridaWallet>>(
    (state) => state?.main?.wallets?.data
  )

  return React.useMemo(() => maybeWalletsData || {}, [])
}
