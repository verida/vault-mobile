import { SerializedNearWallet } from 'features/near'
import { isEqual } from 'lodash'
import { useSelector } from 'react-redux'

import { getNearWalletData } from 'reduxStore/wallet/selectors'

// Returns the serialized data for the Near Wallet in Redux. Note, this is NOT
// a NearWalletInstance, which is instead allocated in
// useCreateOrRestoreNearWalletInstance().
export function useMaybeNearWalletData(): SerializedNearWallet | undefined {
  return useSelector(getNearWalletData, isEqual)
}
