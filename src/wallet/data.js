import { indexerClient } from 'wallet/chains/algorand'
import { chainsApi } from 'wallet/helpers/api'
import { SUPPORTED_TOKENS } from 'wallet/constants'
import { getTokenAddress, isNativeToken } from 'wallet/helpers/tokens'

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
      '0x28C6c06298d514Db089934071355E5743bf21d60',
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

const getTransactions = async (wallets, tokenAddress) => {
  let transactions = []
  let assets = []
  if (tokenAddress.includes('eip155')) {
    if (tokenAddress.includes('slip44')) {
      assets.push('ethereum/native/eth')
    } else {
      assets.push(`ethereum/contract/${getTokenAddress(tokenAddress)}/erc-20`)
    }
    const ethereumTransactions = await chainsApi.get(
      'v2/ethereum/mainnet/account/' +
        '0x28C6c06298d514Db089934071355E5743bf21d60/txs',
      {
        assets,
      }
    )
    const ethTransactions = ethereumTransactions.data.items
    // const userAddr = wallets.ethr.address
    const userAddr = '0x28C6c06298d514Db089934071355E5743bf21d60'
    if (ethTransactions) {
      transactions = ethTransactions
        .filter((tx) => {
          return !!tx.operations.native
        })
        .map((tx) => {
          let trans = tx.operations.native.detail
          let isUserSender = trans.from === userAddr
          return {
            id: tx.id,
            type: isUserSender ? 'sent' : 'received',
            address: isUserSender ? trans.to : trans.from,
            quantity: trans.value,
            pending: false,
          }
        })
    }
  } else {
    const assetID = getTokenAddress(tokenAddress)
    const isNative = isNativeToken(tokenAddress)

    let transactionsData = await indexerClient
      .searchForTransactions()
      .address(wallets.algo.address)
      .assetID(isNative ? null : assetID)
      .txType(isNative ? 'pay' : null)
      .do()

    const userAddr = wallets.algo.address

    const rawTransactions = transactionsData.transactions
    if (rawTransactions) {
      transactions = rawTransactions.map((tx) => {
        let isUserSender = tx.sender === userAddr
        let transferInfo = tx['asset-transfer-transaction']
          ? tx['asset-transfer-transaction']
          : tx['payment-transaction']
        return {
          id: tx.id,
          type: isUserSender ? 'sent' : 'received',
          address: isUserSender ? transferInfo.receiver : tx.sender,
          quantity: transferInfo.amount,
          pending: false,
        }
      })
    }
  }

  return transactions
}

export default { getAllBalances, getTransactions }
