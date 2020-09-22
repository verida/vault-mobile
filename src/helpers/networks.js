import React from 'react';
import EthereumSvg from '../assets/networks/ethereum.svg';
import VeChainSvg from '../assets/networks/vechain.svg';

export const NETWORKS = [
    {
        id: 1,
        title: 'Ethereum',
        logo: <EthereumSvg />
    },
    {
        id: 2,
        title: 'VeChain',
        logo: <VeChainSvg />
    }
];
