import * as Sentry from '@sentry/react-native'
import algosdk from 'algosdk'
import { algodClient, indexerClient } from 'wallet/chains/algorand'
import { web3 } from 'wallet/chains/ethereum'
import initNearClient from 'wallet/chains/near'
import {
  NEAR_GAS_AMOUNT_FUNGIBLE_TRANSFER,
  NEAR_GAS_AMOUNT_TRANSFER,
  SUPPORTED_TOKENS,
} from 'wallet/constants'
import { moralisApi, nearIndexerApi } from 'wallet/helpers/api'
import {
  getNativeForChain,
  getTokenAddress,
  getTokenChain,
  isNativeToken,
  parseUnitsForSending,
} from 'wallet/helpers/tokens'

import {
  getTransactionParamsData,
  getWalletsData,
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
  let list = {}

  try {
    const near = await initNearClient()
    const nearAccount = await near.account(wallets.near.address)

    const nearTokens = SUPPORTED_TOKENS.filter(
      (tk) => tk.address.includes('near:') && tk.address.includes('nep141')
    )

    await nearTokens.forEach(async (nearToken) => {
      const tokBalance = await nearAccount.viewFunction(
        getTokenAddress(nearToken.address),
        'ft_balance_of',
        {
          account_id: wallets.near.address,
        }
      )

      if (tokBalance) {
        list[nearToken.symbol] = tokBalance
      }
    })

    const nearBalance = await nearAccount.getAccountBalance()

    if (nearBalance.total) {
      list.NEAR = parseFloat(nearBalance.total)
    }
  } catch (error) {
    console.log(error)
  }

  try {
    let algorandBalances = await indexerClient
      .lookupAccountByID(wallets.algo.address)
      .do()

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
  } catch (error) {
    console.log(error, 'error')
  }

  try {
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
  } catch (error) {
    console.log(error)
  }

  return list
}

const getTransactions = async (wallets, tokenAddress) => {
  let transactions = []
  if (tokenAddress.includes('near')) {
    const userAddr = wallets.near.address

    let nearTransactions
    let isNative = isNativeToken(tokenAddress)

    if (isNative) {
      nearTransactions = await nearIndexerApi.get('transactions/' + userAddr)
    } else {
      nearTransactions = await nearIndexerApi.get(
        'token_transactions/' + userAddr,
        {
          token: getTokenAddress(tokenAddress),
        }
      )
    }
    const rawTransactions = nearTransactions.data
    if (rawTransactions) {
      transactions = rawTransactions.map((tx) => {
        let isUserSender = tx.signer_account_id === userAddr
        return {
          id: tx.transaction_hash,
          type: isUserSender ? 'sent' : 'received',
          address: isUserSender
            ? isNative
              ? tx.receiver_account_id
              : tx.args.args_json.receiver_id
            : tx.signer_account_id,
          quantity: isNative ? tx.args.deposit : tx.args.args_json.amount,
          pending: false,
        }
      })
    }
  } else if (tokenAddress.includes('eip155')) {
    const userAddr = wallets.ethr.address

    let moralisTransactions
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
  if (tokenAddress.includes('near')) {
    const nearTransaction = await nearIndexerApi.get(
      'transaction/' + transactionID
    )

    let rawTransaction = nearTransaction.data
    let userAddr = wallets.near.address

    let isNative = rawTransaction.action_kind === 'TRANSFER'
    let isUserSender = rawTransaction.signer_account_id === userAddr
    let chain = getTokenChain(tokenAddress)
    let nativeToken = getNativeForChain(chain)
    let feeSymbol = nativeToken.symbol
    let feeDecimal = nativeToken.decimal

    let symbol
    let decimal
    if (!isNative) {
      let tok = SUPPORTED_TOKENS.find(
        (ele) =>
          getTokenAddress(ele.address).toLowerCase() ===
          rawTransaction.receiver_account_id
      )
      symbol = tok.symbol
      decimal = tok.decimal
    } else {
      symbol = nativeToken.symbol
      decimal = nativeToken.decimal
    }

    return {
      id: rawTransaction.transaction_hash,
      type: isUserSender ? 'sent' : 'received',
      address: isUserSender
        ? isNative
          ? rawTransaction.receiver_account_id
          : rawTransaction.args.args_json.receiver_id
        : rawTransaction.signer_account_id,
      quantity: isNative
        ? rawTransaction.args.deposit
        : rawTransaction.args.args_json.amount,
      fee:
        parseInt(rawTransaction.receipt_conversion_tokens_burnt, 10) +
        parseInt(rawTransaction.tokens_burnt, 10),
      round: rawTransaction.included_in_block_hash,
      time: rawTransaction.block_timestamp,
      symbol,
      feeSymbol,
      decimal,
      feeDecimal,
      chain: 'near',
    }
  } else if (tokenAddress.includes('eip155')) {
    const ethTransaction = await moralisApi.get(
      'transaction/' + transactionID,
      {
        chain: 'rinkeby',
      }
    )
    let rawTransaction = ethTransaction.data
    let userAddr = wallets.ethr.address
    // let userAddr = '0x28C6c06298d514Db089934071355E5743bf21d60'

    if (rawTransaction) {
      let isUserSender = rawTransaction.from_address === userAddr.toLowerCase()
      let chain = getTokenChain(tokenAddress)
      let nativeToken = getNativeForChain(chain)
      let feeDecimal = nativeToken.decimal
      let feeSymbol = nativeToken.symbol
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
        symbol = nativeToken.symbol
        decimal = nativeToken.decimal
        quantity = rawTransaction.value
      }
      return {
        id: rawTransaction.hash,
        type: isUserSender ? 'sent' : 'received',
        address: isUserSender
          ? rawTransaction.to_address
          : rawTransaction.from_address,
        quantity,
        fee: rawTransaction.gas_price * rawTransaction.gas,
        round: rawTransaction.block_number,
        time: rawTransaction.block_timestamp,
        symbol,
        feeSymbol,
        decimal,
        feeDecimal,
        chain: 'eip155',
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
      let chain = getTokenChain(tokenAddress)
      let nativeToken = getNativeForChain(chain)
      let feeDecimal = nativeToken.decimal
      let feeSymbol = nativeToken.symbol
      if (rawTransaction['asset-transfer-transaction']) {
        let tok = SUPPORTED_TOKENS.find(
          (ele) =>
            getTokenAddress(ele.address) ===
            rawTransaction['asset-transfer-transaction']['asset-id'].toString()
        )
        symbol = tok.symbol
        decimal = tok.decimal
      } else {
        symbol = nativeToken.symbol
        decimal = nativeToken.decimal
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
        feeDecimal,
        chain: 'algorand',
      }
    } else {
      return {}
    }
  }
}

const getTransactionParams = async (transactionData, wallets) => {
  if (transactionData.token.address.includes('near')) {
    const units = isNativeToken(transactionData.token.address)
      ? NEAR_GAS_AMOUNT_TRANSFER
      : NEAR_GAS_AMOUNT_FUNGIBLE_TRANSFER

    const near = await initNearClient()
    const response = await near.connection.provider.gasPrice()

    const params = { fee: parseInt(response.gas_price, 10) * units }

    return params
  } else if (transactionData.token.address.includes('eip155')) {
    let fromAddress = wallets.ethr.address
    let toAddress = transactionData.address
    const gasPrice = await web3.eth.getGasPrice()

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
      const params = { gas: estimateGas, fee: gasPrice * estimateGas }

      return params
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error, 'error')
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

  if (transactionData.token.address.includes('near:')) {
    let amount = (amount = parseUnitsForSending(
      transactionData.amount,
      transactionData.token.decimal
    ))
    let tokenAddress = getTokenAddress(transactionData.token.address)

    const near = await initNearClient()
    const nearAccount = await near.account(wallets.near.address)

    let tx

    if (isNativeToken(transactionData.token.address)) {
      tx = await nearAccount.sendMoney(
        transactionData.address, // receiver account
        amount.toString() // amount in yoctoNEAR
      )
    } else {
      tx = await nearAccount.functionCall(
        tokenAddress,
        'ft_transfer',
        {
          receiver_id: transactionData.address,
          amount: amount.toString(),
        },
        null,
        1
      )
    }

    let chain = getTokenChain(transactionData.token.address)
    let nativeToken = getNativeForChain(chain)

    const txData = {
      id: tx.transaction.hash,
      amount: amount,
      fee: tx.transaction_outcome.outcome.tokens_burnt,
      to: transactionData.address,
      from: wallets.near.address,
      token: transactionData.token,
      feeSymbol: nativeToken.symbol,
      chain: 'near',
    }

    return txData
  } else if (transactionData.token.address.includes('eip155')) {
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
        gas: transactionParams.gas,
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
        gas: transactionParams.gas,
        // gasPrice: web3.utils.toHex(20 * 1e9),
        // gasLimit: web3.utils.toHex(210000),
        to: tokenAddress,
        value: 0x0,
        data: contract.methods.transfer(toAddress, amount).encodeABI(),
        nonce: nonce,
      }
    }

    try {
      const signedTx = await web3.eth.accounts.signTransaction(
        transaction,
        wallets.ethr.privateKey.substring(2, wallets.ethr.privateKey.length)
      )

      let transactionHash = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      )

      let chain = getTokenChain(transactionData.token.address)
      let nativeToken = getNativeForChain(chain)

      if (transactionHash) {
        const txData = {
          id: transactionHash.transactionHash,
          amount: parseFloat(amount.toString()),
          fee: transaction.gas,
          to: transactionData.address,
          from: wallets.ethr.address,
          token: transactionData.token,
          feeSymbol: nativeToken.symbol,
          chain: 'eip155',
        }

        return txData
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error, 'tx error')
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

    let chain = getTokenChain(transactionData.token.address)
    let nativeToken = getNativeForChain(chain)

    const txData = {
      id: sent.txId,
      amount: transaction.amount,
      fee: transaction.fee,
      to: transactionData.address,
      from: wallets.algo.address,
      token: transactionData.token,
      feeSymbol: nativeToken.symbol,
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
