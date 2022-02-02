import { indexerClient } from 'wallet/chains/algorand'
import { chainsApi } from 'wallet/helpers/api'
import { SUPPORTED_TOKENS } from 'wallet/constants'
import { getTokenAddress } from 'wallet/helpers/tokens'

const getAllBalances = async (wallets) => {
  let algorandBalances = await indexerClient
    .lookupAccountByID(wallets.algo.address)
    .do()

  let assets = []
  SUPPORTED_TOKENS.forEach((token) => {
    if (token.address.includes('eip155')) {
      if (token.address.includes('slip44')) {
        assets.push('ethereum/native/eth')
      } else {
        assets.push(
          `ethereum/contract/${getTokenAddress(token.address)}/erc-20`
        )
      }
    }
  })

  const ethereumBalances = await chainsApi.get(
    'v2/ethereum/mainnet/account/' +
      '0x00000000219ab540356cBB839Cbe05303d7705Fa',
    {
      assets: assets.join(','),
    }
  )

  let list = {}

  if (algorandBalances.account) {
    const algoBalanceData = algorandBalances.account
    // TODO: dont hardcode
    list.ALGO = algoBalanceData.amount
    if (algoBalanceData.assets) {
      algoBalanceData.assets.map((balance) => {
        let tok
        tok = SUPPORTED_TOKENS.find((ele) => {
          let tokenAddress = getTokenAddress(ele.address)
          if (balance['asset-id']) {
            return tokenAddress === balance['asset-id'].toString()
          } else {
            return false
          }
        })
        if (tok) {
          list[tok.symbol] = balance.amount
        }
      })
    }
  }

  if (ethereumBalances.data) {
    Object.values(ethereumBalances.data).map((obj) => {
      let tok
      tok = SUPPORTED_TOKENS.find((ele) => {
        // let tokenAddress = getTokenAddress(ele.address)
        return ele.symbol === obj.currency.symbol
      })
      if (tok) {
        list[tok.symbol] = parseFloat(obj.balance)
      }
    })
  }

  return list
}

export default { getAllBalances }
