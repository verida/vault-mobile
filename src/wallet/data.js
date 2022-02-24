import algosdk from 'algosdk'

import { indexerClient, algodClient } from 'wallet/chains/algorand'
import { web3 } from 'wallet/chains/ethereum'
import { moralisApi } from 'wallet/helpers/api'
import { SUPPORTED_TOKENS } from 'wallet/constants'
import {
  getTokenAddress,
  isNativeToken,
  parseUnitsForSending,
} from 'wallet/helpers/tokens'
import {
  getWalletsData,
  getTransactionParamsData,
} from 'reduxStore/wallet/selectors'

const minABI = [
  // transfer
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    type: 'function',
  },
]

const getAllBalances = async (wallets) => {
  let algorandBalances = await indexerClient
    .lookupAccountByID(wallets.algo.address)
    .do()

  const ethNativeBalance = await moralisApi.get(
    // '0x28C6c06298d514Db089934071355E5743bf21d60' + '/balance',
    wallets.ethr.address + '/balance',
    {
      chain: 'rinkeby',
    }
  )

  const ethereumBalances = await moralisApi.get(
    // '0x28C6c06298d514Db089934071355E5743bf21d60' + '/erc20',
    wallets.ethr.address + '/erc20',
    {
      chain: 'rinkeby',
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

  if (ethNativeBalance.data) {
    list.ETH = parseFloat(ethNativeBalance.data.balance)
  }

  if (ethereumBalances.data) {
    Object.values(ethereumBalances.data).map((obj) => {
      let tok = SUPPORTED_TOKENS.find((ele) => {
        // let tokenAddress = getTokenAddress(ele.address)
        return ele.symbol === obj.symbol
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
  let moralisTransactions
  if (tokenAddress.includes('eip155')) {
    const userAddr = wallets.ethr.address
    // const userAddr = '0x28C6c06298d514Db089934071355E5743bf21d60'

    if (isNativeToken(tokenAddress)) {
      moralisTransactions = await moralisApi.get(userAddr, {
        chain: 'rinkeby',
      })

      const ethTransactions = moralisTransactions.data.result
      if (ethTransactions) {
        transactions = ethTransactions.map((tx) => {
          let isUserSender = tx.from_address === userAddr.toLowerCase()
          return {
            id: tx.hash,
            type: isUserSender ? 'sent' : 'received',
            address: isUserSender ? tx.to_address : tx.from_address,
            quantity: tx.value,
            pending: false,
          }
        })
      }
    } else {
      moralisTransactions = await moralisApi.get(
        userAddr + '/erc20/transfers',
        {
          chain: 'rinkeby',
        }
      )

      const ethTransactions = moralisTransactions.data.result
      if (ethTransactions) {
        let contractAddress = getTokenAddress(tokenAddress)

        transactions = ethTransactions
          .filter((tx) => {
            return tx.address === contractAddress.toLowerCase()
          })
          .map((tx) => {
            let isUserSender = tx.from_address === userAddr.toLowerCase()
            return {
              id: tx.transaction_hash,
              type: isUserSender ? 'sent' : 'received',
              address: isUserSender ? tx.to_address : tx.from_address,
              quantity: tx.value,
              pending: false,
            }
          })
      }
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

const getTransactionDetails = async (transactionID, tokenAddress, wallets) => {
  if (tokenAddress.includes('eip155')) {
    const ethTransaction = await moralisApi.get(
      'transaction/' + transactionID,
      {
        chain: 'rinkeby',
      }
    )
    let rawTransaction = ethTransaction.data
    console.log(rawTransaction, 'rawTransaction')
    let userAddr = wallets.ethr.address
    // let userAddr = '0x28C6c06298d514Db089934071355E5743bf21d60'

    if (rawTransaction) {
      let isUserSender = rawTransaction.from_address === userAddr.toLowerCase()
      let symbol
      let decimal
      let quantity
      if (rawTransaction.logs[0]) {
        let nonNativeTx = rawTransaction.logs[0]
        let tok = SUPPORTED_TOKENS.find(
          (ele) =>
            getTokenAddress(ele.address).toLowerCase() === nonNativeTx.address
        )
        symbol = tok.symbol
        decimal = tok.decimal
        quantity = parseInt(nonNativeTx.data, 16)
      } else {
        symbol = SUPPORTED_TOKENS[2].symbol
        decimal = SUPPORTED_TOKENS[2].decimal
        quantity = rawTransaction.value
      }
      let feeSymbol = SUPPORTED_TOKENS[2].symbol
      return {
        id: rawTransaction.hash,
        type: isUserSender ? 'sent' : 'received',
        address: isUserSender
          ? rawTransaction.to_address
          : rawTransaction.from_address,
        quantity,
        fee: rawTransaction.gas,
        round: rawTransaction['block_number'],
        time: rawTransaction['block_timestamp'],
        symbol,
        feeSymbol,
        decimal,
        chain: 'ethereum',
      }
    } else {
      return {}
    }
  } else {
    let transactionData = await indexerClient
      .lookupTransactionByID(transactionID)
      .do()

    let rawTransaction = transactionData.transaction
    let userAddr = wallets.algo.address

    if (rawTransaction) {
      let isUserSender = rawTransaction.sender === userAddr
      let transferInfo = rawTransaction['asset-transfer-transaction']
        ? rawTransaction['asset-transfer-transaction']
        : rawTransaction['payment-transaction']
      let symbol
      let decimal
      let feeSymbol = SUPPORTED_TOKENS[0].symbol
      if (rawTransaction['asset-transfer-transaction']) {
        let tok = SUPPORTED_TOKENS.find(
          (ele) =>
            getTokenAddress(ele.address) ===
            rawTransaction['asset-transfer-transaction']['asset-id'].toString()
        )
        symbol = tok.symbol
        decimal = tok.decimal
      } else {
        symbol = SUPPORTED_TOKENS[0].symbol
        decimal = SUPPORTED_TOKENS[0].decimal
      }
      return {
        id: rawTransaction.id,
        type: isUserSender ? 'sent' : 'received',
        address: isUserSender ? transferInfo.receiver : rawTransaction.sender,
        quantity: transferInfo.amount,
        fee: rawTransaction.fee,
        round: rawTransaction['confirmed-round'],
        time: rawTransaction['round-time'],
        symbol,
        feeSymbol,
        decimal,
        chain: 'algorand',
      }
    } else {
      return {}
    }
  }
}

const getTransactionParams = async (transactionData, wallets) => {
  if (transactionData.token.address.includes('eip155')) {
    let fromAddress = wallets.ethr.address
    let toAddress = transactionData.address

    let input
    if (isNativeToken(transactionData.token.address)) {
      input = {
        from: fromAddress,
        to: toAddress,
        value: parseUnitsForSending(
          transactionData.amount,
          transactionData.token.decimal
        ),
      }
    } else {
      let tokenAddress = getTokenAddress(transactionData.token.address)

      let contract = new web3.eth.Contract(minABI, tokenAddress, {
        from: fromAddress,
      })

      input = {
        from: fromAddress,
        to: tokenAddress,
        value: 0x0,
        data: contract.methods
          .transfer(
            toAddress,
            parseUnitsForSending(
              transactionData.amount,
              transactionData.token.decimal
            )
          )
          .encodeABI(),
      }
    }

    try {
      const estimateGas = await web3.eth.estimateGas(input)
      console.log(estimateGas, 'estimateGas getTransactionParams')
      const params = { fee: estimateGas }
      console.log(params, 'params getTransactionParams')

      return params
    } catch (error) {
      console.log(error, 'error')
    }
  } else {
    const params = await algodClient.getTransactionParams().do()
    if (params.fee === 0) {
      params.fee = 1000
      params.flatFee = true
    }

    return params
  }
}

const sendTransaction = async (
  transactionData,
  isAssetEnablingTransaction,
  state
) => {
  const wallets = getWalletsData(state)

  if (transactionData.token.address.includes('eip155')) {
    let transactionParams = getTransactionParamsData(state)
    let amount = (amount = parseUnitsForSending(
      transactionData.amount,
      transactionData.token.decimal
    ))

    const nonce = await web3.eth.getTransactionCount(
      wallets.ethr.address,
      'latest'
    )

    let transaction

    if (isNativeToken(transactionData.token.address)) {
      transaction = {
        to: transactionData.address, // faucet address to return eth
        value: amount,
        gas: transactionParams.fee,
        // maxFeePerGas: estimateGas,
        // maxPriorityFeePerGas: estimateGas,
        nonce: nonce,
      }
    } else {
      let tokenAddress = getTokenAddress(transactionData.token.address)
      let toAddress = transactionData.address
      let fromAddress = wallets.ethr.address

      let contract = new web3.eth.Contract(minABI, tokenAddress, {
        from: fromAddress,
      })

      // call transfer function
      transaction = {
        from: fromAddress,
        gas: transactionParams.fee,
        // gasPrice: web3.utils.toHex(20 * 1e9),
        // gasLimit: web3.utils.toHex(210000),
        to: tokenAddress,
        value: 0x0,
        data: contract.methods.transfer(toAddress, amount).encodeABI(),
        nonce: nonce,
      }
    }
    console.log(transaction, 'transaction')

    try {
      const signedTx = await web3.eth.accounts.signTransaction(
        transaction,
        wallets.ethr.privateKey.substring(2, wallets.ethr.privateKey.length)
      )
      console.log(signedTx, 'signedTx')

      let TxHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

      console.log(TxHash, 'TxHash')

      if (TxHash) {
        const txData = {
          id: TxHash.transactionHash,
          amount: parseFloat(amount.toString()),
          fee: transaction.gas,
          to: transactionData.address,
          from: wallets.ethr.address,
          token: transactionData.token,
          feeSymbol: SUPPORTED_TOKENS[2].symbol,
          chain: 'ethereum',
        }

        return txData
      }
    } catch (error) {
      console.log(error, 'tx error')
    }
  } else {
    let transactionParams
    if (isAssetEnablingTransaction) {
      transactionParams = await algodClient.getTransactionParams().do()
    } else {
      transactionParams = getTransactionParamsData(state)
    }
    let isNative = isNativeToken(transactionData.token.address)
    let tokenAddress = getTokenAddress(transactionData.token.address)

    let transaction

    if (isNative) {
      transaction = algosdk.makePaymentTxnWithSuggestedParams(
        wallets.algo.address,
        transactionData.address,
        parseInt(
          parseUnitsForSending(
            transactionData.amount,
            transactionData.token.decimal
          ).toHexString(),
          16
        ),
        undefined,
        undefined,
        transactionParams
      )
    } else {
      transaction = algosdk.makeAssetTransferTxnWithSuggestedParams(
        wallets.algo.address,
        isAssetEnablingTransaction
          ? wallets.algo.address
          : transactionData.address,
        undefined,
        undefined,
        isAssetEnablingTransaction
          ? 0
          : parseInt(
              parseUnitsForSending(
                transactionData.amount,
                transactionData.token.decimal
              ).toHexString(),
              16
            ),
        undefined,
        parseInt(tokenAddress, 10),
        transactionParams
      )
    }

    const privateKey = wallets.algo.privateKey

    const secretKey = Buffer.from(
      privateKey.substring(2, privateKey.length),
      'hex'
    ).toJSON().data

    const mnemonic = algosdk.secretKeyToMnemonic(secretKey)
    const wallet = algosdk.mnemonicToSecretKey(mnemonic)

    const signedTransaction = transaction.signTxn(wallet.sk)

    const sent = await algodClient.sendRawTransaction(signedTransaction).do()

    const txData = {
      id: sent.txId,
      amount: transaction.amount,
      fee: transaction.fee,
      to: transactionData.address,
      from: wallets.algo.address,
      token: transactionData.token,
      feeSymbol: SUPPORTED_TOKENS[0].symbol,
      chain: 'algorand',
    }

    return txData
  }
}

export default {
  getAllBalances,
  getTransactions,
  getTransactionDetails,
  getTransactionParams,
  sendTransaction,
}
