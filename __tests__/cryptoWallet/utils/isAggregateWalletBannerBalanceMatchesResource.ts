import 'jest'

import { AssetIdParams, ChainIdParams } from 'caip'

import { SupportedBlockchainNamespace } from '../../../src/features/blockchain/@types'
import {
  AggregateWalletBannerBalance,
  isAssetTypeResourceParams,
  isChainIdResourceParams,
} from '../../../src/features/cryptoWallet/@types'
import { isAggregateWalletBannerBalanceMatchesResource } from '../../../src/features/cryptoWallet/utils/isAggregateWalletBannerBalanceMatchesResource'

const AGGREGATE_WALLET_BANNER_BALANCES_ETH = {
  balance: '0',
  decimals: 18,
  icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  label: 'Ethereum (goerli)',
  resource: {
    namespace: 'eip155',
    reference: '5',
  },
  symbol: 'ETH',
  type: 0,
  valuation: {
    conversionRate: '2036.8134204557246',
    currency: 'USD',
    price: '0',
    rates: {
      DAILY: -0.92184005,
    },
  },
} as unknown as AggregateWalletBannerBalance

const AGGREGATE_WALLET_BANNER_BALANCES_USDC = {
  balance: '100000000',
  decimals: 6,
  icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
  label: 'USDC',
  resource: {
    assetName: {
      namespace: 'ERC20',
      reference: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    },
    chainId: {
      namespace: 'eip155',
      reference: '5',
    },
    tokenId: '1',
  },
  symbol: 'USDC',
  type: 1,
  valuation: {
    conversionRate: '1.0000740580469532',
    currency: 'USD',
    price: '100.00740580469532',
    rates: {
      DAILY: 0.02249028,
    },
  },
} as unknown as AggregateWalletBannerBalance

describe('cryptoWallet/utils/isAggregateWalletBannerBalanceMatchesResource', () => {
  it('mock', () => {
    const chainResource: ChainIdParams = {
      namespace: SupportedBlockchainNamespace.EIP_155,
      reference: '5',
    }

    const assetResource: AssetIdParams = {
      chainId: chainResource,
      assetName: {
        namespace: 'ERC20',
        reference: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
      },
      tokenId: '1',
    }

    expect(isChainIdResourceParams(chainResource)).toBeTruthy()
    expect(isAssetTypeResourceParams(chainResource)).toBeFalsy()

    expect(isChainIdResourceParams(assetResource)).toBeFalsy()
    expect(isAssetTypeResourceParams(assetResource)).toBeTruthy()

    expect(
      isChainIdResourceParams(AGGREGATE_WALLET_BANNER_BALANCES_USDC.resource)
    ).toBeFalsy()

    expect(
      isAssetTypeResourceParams(AGGREGATE_WALLET_BANNER_BALANCES_USDC.resource)
    ).toBeTruthy()

    expect(
      isChainIdResourceParams(AGGREGATE_WALLET_BANNER_BALANCES_ETH.resource)
    ).toBeTruthy()

    expect(
      isAssetTypeResourceParams(AGGREGATE_WALLET_BANNER_BALANCES_ETH.resource)
    ).toBeFalsy()

    expect(
      isAggregateWalletBannerBalanceMatchesResource({
        aggregateWalletBannerBalance: AGGREGATE_WALLET_BANNER_BALANCES_ETH,
        resource: chainResource,
      })
    ).toBeTruthy()

    expect(
      isAggregateWalletBannerBalanceMatchesResource({
        aggregateWalletBannerBalance: AGGREGATE_WALLET_BANNER_BALANCES_ETH,
        resource: assetResource,
      })
    ).toBeFalsy()

    expect(
      isAggregateWalletBannerBalanceMatchesResource({
        aggregateWalletBannerBalance: AGGREGATE_WALLET_BANNER_BALANCES_USDC,
        resource: assetResource,
      })
    ).toBeTruthy()

    expect(
      isAggregateWalletBannerBalanceMatchesResource({
        aggregateWalletBannerBalance: AGGREGATE_WALLET_BANNER_BALANCES_USDC,
        resource: chainResource,
      })
    ).toBeFalsy()
  })
})
