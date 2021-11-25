import utils from './utils'
import pricingHelper from './helpers/pricing'
import chainHelper from './helpers/chain'
import { AccountId, AssetType } from 'caip'

class Wallet {
  public async createWallets() {
    const wallets = chainHelper.createWallets()

    return wallets
  }

  public async getTokensList(walletAddress: AccountId.AccountIdParams) {
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
  ) {
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
