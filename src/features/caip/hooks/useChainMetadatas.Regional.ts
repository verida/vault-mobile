import { selectSelectedPublicProfile } from 'features/profiles'
import * as React from 'react'

import { useAppSelector } from 'reduxStore/types'

import {
  ChainMetadata,
  SupportedCaipNamespace,
  UseChainMetadataState,
} from '../@types'

const EMPTY_RESULT: UseChainMetadataState = { loading: false, result: [] }

// TODO: To wallet provider?
const REDBELLY_NETWORK_TESNET: ChainMetadata = {
  namespace: SupportedCaipNamespace.EIP_155,
  reference: '153',
  rpcUrls: [
    'https://rbn-gcp-australia-southeast1-a-0-b-v2.devnet.redbelly.network:8545',
  ],
  name: 'Redbelly Network Testnet',
}

// Returns default networks depending upon a user's region.
export function useChainMetadatasRegional(): UseChainMetadataState {
  const publicProfileData = useAppSelector(selectSelectedPublicProfile)

  const maybeCountry = publicProfileData?.country

  return React.useMemo<UseChainMetadataState>(() => {
    if (typeof maybeCountry !== 'string' || !maybeCountry.length)
      return EMPTY_RESULT

    if (maybeCountry === 'Australia') {
      return { loading: false, result: [REDBELLY_NETWORK_TESNET] }
    }

    return EMPTY_RESULT
  }, [maybeCountry])
}
