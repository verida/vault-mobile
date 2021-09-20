import React from 'react'
import EthereumSvg from '../assets/networks/ethereum.svg'
import NearSvg from '../assets/networks/near.svg'

export const NETWORKS = [
  {
    id: 'ethr',
    title: 'Ethereum',
    logo: <EthereumSvg />,
  },
  {
    id: 'near',
    title: 'NEAR',
    logo: <NearSvg />,
  },
]
