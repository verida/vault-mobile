import utils from './utils'
import pricingHelper from './helpers/pricing'
import chainHelper from './helpers/chain'
import { Token } from './types'

class Wallet {
  public async createWallets() {
    const wallets = chainHelper.createWallets()

    return wallets
  }

  public async getTokensList(walletAddress: string) {
    // uses recognized tokens list from constants
    const tokensOwned = chainHelper.getOwnedTokensForAllChains(walletAddress)

    const pricesList = pricingHelper.getPricesForTokens()

    const list = utils.mapBalancesToPrices(pricesList, tokensOwned)

    const total = utils.calculateTotalForAllTokens(pricesList, tokensOwned)

    return { list, total }
  }

  public async getTokenTransactions(walletAddress: string, token: Token) {
    const tokenOwned = chainHelper.getOwnedQuantityForSingleToken(
      walletAddress,
      token
    )

    const list = chainHelper.getTransactionListForToken(walletAddress, token)

    const tokenPrice = pricingHelper.getPriceForSingleToken(token)

    return { list, tokenOwned, tokenPrice }
  }

  public async signAndSendSignedTransaction(
    walletAddress: string,
    token: Token,
    quantity: number,
    chain,
    toAddress: string
  ) {
    return chainHelper.signAndSendSignedTransaction(
      walletAddress,
      token,
      quantity,
      chain,
      toAddress
    )
  }
}

export default Wallet
