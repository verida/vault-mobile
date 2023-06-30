import { SerializedNearWallet } from 'features/near'
import { useSelector } from 'react-redux'

import { RootState } from 'reduxStore/types'
import { getWalletsData } from 'reduxStore/wallet/selectors'

export function useMaybeSerializedNearWallet():
  | SerializedNearWallet
  | undefined {
  // https://github.com/verida/vault-mobile/blob/1d34080ed6ca9e8a821e0c7c9c33c2e62dc88a42/src/wallet-connect/helpers/NearWalletUtil.ts#LL13C3-L13C56
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return useSelector<RootState, SerializedNearWallet | undefined>(
    (state) => getWalletsData(state?.main)?.near
  )
}
