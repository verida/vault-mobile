import algosdk from 'algosdk'
import * as nearAPI from 'near-api-js'
import { algodClient } from 'wallet/chains/algorand'
import { web3 } from 'wallet/chains/ethereum'
import initNearClient from 'wallet/chains/near'
import {
  NEAR_GAS_AMOUNT_FUNGIBLE_TRANSFER,
  NEAR_GAS_AMOUNT_TRANSFER,
} from 'wallet/constants'
import { walletProviderApi } from 'wallet/helpers/api'
import {
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

const getTransactionParams = async (transactionData, wallets) => {
  if (getTokenChain(transactionData.token.asset) === 'near') {
    const units = isNativeToken(transactionData.token.asset)
      ? NEAR_GAS_AMOUNT_TRANSFER
      : NEAR_GAS_AMOUNT_FUNGIBLE_TRANSFER

    const near = await initNearClient()
    const response = await near.connection.provider.gasPrice()

    const params = { fee: parseInt(response.gas_price, 10) * units }

    return params
  } else if (getTokenChain(transactionData.token.asset) === 'eip155') {
    let fromAddress = wallets.ethr.address
    let toAddress = transactionData.address
    const gasPrice = await web3.eth.getGasPrice()

    let input
    if (isNativeToken(transactionData.token.asset)) {
      input = {
        from: fromAddress,
        to: toAddress,
        value: parseUnitsForSending(
          transactionData.amount,
          transactionData.token.decimal
        ),
      }
    } else {
      let tokenAddress = getTokenAddress(transactionData.token.asset)

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
  const amount = parseUnitsForSending(
    transactionData.amount,
    transactionData.token.decimal
  )
  const tokenAddress = getTokenAddress(transactionData.token.asset)
  const isTokenNative = isNativeToken(transactionData.token.asset)
  const tokenChain = getTokenChain(transactionData.token.asset)
  const receiverAddress = transactionData.address

  let txString
  let txData
  let txIdAlgo

  if (tokenChain === 'near') {
    const near = await initNearClient()
    const nearAccount = await near.account(wallets.near.address)
    let actions
    let txAddress
    if (isTokenNative) {
      actions = [nearAPI.transactions.transfer(amount.toString())]
      txAddress = receiverAddress
    } else {
      actions = [
        nearAPI.transactions.functionCall(
          'ft_transfer',
          {
            receiver_id: receiverAddress,
            amount: amount.toString(),
          },
          5430000000000,
          1
        ),
      ]
      txAddress = tokenAddress
    }

    const signedTx = await nearAccount.signTransaction(txAddress, actions)

    const signedTransaction = new nearAPI.transactions.SignedTransaction({
      transaction: signedTx[1].transaction,
      signature: signedTx[1].signature,
    })
    const signedSerializedTx = signedTransaction.encode()

    txString = Buffer.from(signedSerializedTx).toString('base64')

    txData = {
      amount: amount,
      to: receiverAddress,
      from: wallets.near.address,
      token: transactionData.token,
      chain: tokenChain,
    }
  } else if (tokenChain === 'eip155') {
    let transactionParams = getTransactionParamsData(state)

    const nonce = await web3.eth.getTransactionCount(
      wallets.ethr.address,
      'latest'
    )

    let transaction
    if (isTokenNative) {
      transaction = {
        to: receiverAddress, // faucet address to return eth
        value: amount,
        gas: transactionParams.gas,
        // maxFeePerGas: estimateGas,
        // maxPriorityFeePerGas: estimateGas,
        nonce: nonce,
      }
    } else {
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
        data: contract.methods.transfer(receiverAddress, amount).encodeABI(),
        nonce: nonce,
      }
    }

    const signedTransaction = await web3.eth.accounts.signTransaction(
      transaction,
      wallets.ethr.privateKey.substring(2, wallets.ethr.privateKey.length)
    )

    txString = signedTransaction.rawTransaction

    txData = {
      amount: amount,
      to: receiverAddress,
      from: wallets.ethr.address,
      token: transactionData.token,
      chain: tokenChain,
    }
  } else if (tokenChain === 'algorand') {
    let transactionParams
    if (isAssetEnablingTransaction) {
      transactionParams = await algodClient.getTransactionParams().do()
    } else {
      transactionParams = getTransactionParamsData(state)
    }

    let transaction

    if (isTokenNative) {
      transaction = algosdk.makePaymentTxnWithSuggestedParams(
        wallets.algo.address,
        receiverAddress,
        parseInt(amount.toHexString(), 16),
        undefined,
        undefined,
        transactionParams
      )
    } else {
      transaction = algosdk.makeAssetTransferTxnWithSuggestedParams(
        wallets.algo.address,
        isAssetEnablingTransaction ? wallets.algo.address : receiverAddress,
        undefined,
        undefined,
        isAssetEnablingTransaction ? 0 : parseInt(amount.toHexString(), 16),
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

    txIdAlgo = transaction.txID().toString()

    txString = transaction.signTxn(wallet.sk).toString()

    txData = {
      amount: amount,
      to: receiverAddress,
      from: wallets.algo.address,
      token: transactionData.token,
      chain: tokenChain,
    }
  }

  if (txString) {
    const requestBody = {
      signedTransaction: txString,
      asset: transactionData.token.asset,
    }
    if (txIdAlgo) {
      requestBody.transactionId = txIdAlgo
    }
    const sentTx = await walletProviderApi.post(
      'transaction/broadcast',
      requestBody
    )
    if (sentTx && sentTx.data.data.transactionId) {
      txData.id = sentTx.data.data.transactionId
    }
    return txData
  }
}

export default {
  getTransactionParams,
  sendTransaction,
}
