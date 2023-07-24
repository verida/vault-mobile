import { useSelector } from 'react-redux'

import { RootState } from 'reduxStore/types'

// https://github.com/verida/vault-mobile/blob/1d34080ed6ca9e8a821e0c7c9c33c2e62dc88a42/src/pages/WalletConnect/ConnectDappModal.tsx#LL45C3-L45C79
// https://github.com/verida/vault-mobile/blob/1d34080ed6ca9e8a821e0c7c9c33c2e62dc88a42/src/pages/WalletConnect/ConnectDappModalv2.tsx#L58
export function useMaybeSelectedWalletId() {
  return useSelector<RootState, string | undefined>(
    // @ts-expect-error we haven't typed redux
    (state) => state?.main?.selectedWallet
  )
}
