import utils from './utils'
import pricingHelper from './helpers/pricing'
import chainHelper from './helpers/chain'
import { AccountId, AssetType } from 'caip'
import {
  Transaction,
  TokenBalance,
  TokenPrice,
  TokenWithBalanceAndPrice,
} from '/wallet/types'

class Wallet {
  public async createWallets() {
    const wallets = chainHelper.createWallets()

    return wallets
  }

  public getTokensList(walletAddress: AccountId.AccountIdParams): {
    list: TokenWithBalanceAndPrice[]
    total: number
  } {
    // uses recognized tokens list from constants
    const tokensOwned = chainHelper.getOwnedTokensForAllChains(walletAddress)

    const pricesList = pricingHelper.getPricesForTokens()

    const list = utils.mapBalancesToPrices(pricesList, tokensOwned)

    const total = utils.calculateTotalForAllTokens(pricesList, tokensOwned)

    return { list, total }
  }

  public getTokenTransactions(
    walletAddress: AccountId.AccountIdParams,
    token: AssetType.AssetTypeParams
  ): {
    list: Transaction[]
    tokenOwned: number
    tokenPrice: number
  } {
    const tokenOwned = chainHelper.getOwnedQuantityForSingleToken(
      walletAddress,
      token
    )

    const list = chainHelper.getTransactionListForToken(walletAddress, token)

    const tokenPrice = pricingHelper.getPriceForSingleToken(token)

    return { list, tokenOwned, tokenPrice }
  }

  public async signAndSendSignedTransaction(
    walletAddress: AccountId.AccountIdParams,
    token: AssetType.AssetTypeParams,
    quantity: number,
    toAddress: AccountId.AccountIdParams
  ) {
    return chainHelper.signAndSendSignedTransaction(
      walletAddress,
      token,
      quantity,
      toAddress
    )
  }
}

export default Wallet
