import { useSelector } from 'react-redux'

import { useGetBalancesQuery } from '../api'
import { getUniqueWalletAddresses, getWallets } from '../slice'

export function useWalletBannerBalance() {
  const wallets = useSelector(getWallets)
  const addresses = getUniqueWalletAddresses(wallets)

  const { data, ...extras } = useGetBalancesQuery(addresses)

  const { list, total } = data || {}

  return { list, total, ...extras }
}
