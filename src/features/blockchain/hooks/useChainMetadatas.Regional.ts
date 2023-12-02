import { SupportedBlockchainNamespace } from 'features/blockchain/@types/enums'
import { ChainMetadata, UseChainMetadataState } from 'features/caip'
import { selectSelectedPublicProfile } from 'features/profiles'
import * as React from 'react'

import { useAppSelector } from 'reduxStore/types'

const EMPTY_RESULT: UseChainMetadataState = { loading: false, result: [] }

// TODO: To wallet provider?
const REDBELLY_NETWORK: ChainMetadata = {
  namespace: SupportedBlockchainNamespace.EIP_155,
  reference: '153',
  rpcUrls: [
    'https://rbn-gcp-australia-southeast1-a-0-b-v2.devnet.redbelly.network:8545',
  ],
  name: 'Redbelly Network Testnet',
  symbol: 'RBNT',
  decimals: 18,
  nativeCurrencyName: 'Redbelly Network Token',
  icon: 'https://miro.medium.com/v2/resize:fit:2400/1*DTXE8qJPlRelwhGfo1YSkQ.png',
  blockExplorers: [
    {
      url: 'https://explorer.devnet.redbelly.network',
      name: 'Redbelly Blockchain Explorer',
    },
  ],
  isMainnet: true,
}

// Returns default networks depending upon a user's region.
export function useChainMetadatasRegional(): UseChainMetadataState {
  const publicProfileData = useAppSelector(selectSelectedPublicProfile)

  const maybeCountry = publicProfileData?.country

  return React.useMemo<UseChainMetadataState>(() => {
    if (typeof maybeCountry !== 'string' || !maybeCountry.length)
      return EMPTY_RESULT

    if (maybeCountry === 'Australia') {
      return { loading: false, result: [REDBELLY_NETWORK] }
    }

    return EMPTY_RESULT
  }, [maybeCountry])
}
