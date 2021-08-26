import React from 'react'
import EthereumSvg from '../assets/networks/ethereum.svg'
import NearSvg from '../assets/networks/near.svg'
import VeChainSvg from '../assets/networks/vechain.svg'

export const NETWORKS = [
  {
    id: 0,
    title: 'Ethereum',
    logo: <EthereumSvg />,
  },
  {
    id: 1,
    title: 'NEAR',
    logo: <NearSvg />,
  },
  {
    id: 2,
    title: 'VeChain',
    logo: <VeChainSvg />,
  },
]
