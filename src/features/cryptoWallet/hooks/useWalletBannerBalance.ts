import * as React from 'react'
import { useSelector } from 'react-redux'

import { useGetBalancesQuery } from '../api'
import { getUniqueWalletAddresses, getWallets } from '../slice'

export function useWalletBannerBalance() {
  const wallets = useSelector(getWallets)

  const { data, ...extras } = useGetBalancesQuery(
    React.useMemo(() => getUniqueWalletAddresses(wallets), [wallets])
  )

  const { list, total } = data || {}

  return { list, total, ...extras }
}
