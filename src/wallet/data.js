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
  getTokenChainReference,
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

const getTransactionParams = async (transactionData) => {
  if (getTokenChain(transactionData.token.asset) === 'near') {
    const units = isNativeToken(transactionData.token.asset)
      ? NEAR_GAS_AMOUNT_TRANSFER
      : NEAR_GAS_AMOUNT_FUNGIBLE_TRANSFER

    const near = await initNearClient()
    const response = await near.connection.provider.gasPrice()

    const params = { fee: parseInt(response.gas_price, 10) * units }

    return params
  } else {
    const request = await walletProviderApi.post(
      'transaction/fees',
      transactionData.token.asset
    )

    return request.data.data
  }
}

const sendTransaction = async (
  transactionData,
  isAssetEnablingTransaction,
  state
) => {
  const wallets = getWalletsData(state)
  const chainMapping = {
    'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=': 'algo',
    'eip155:4': 'ethr',
    'near:testnet': 'near',
    'eip155:80001': 'poly',
  }
  const amount = parseUnitsForSending(
    transactionData.amount,
    transactionData.token.decimal
  )
  const tokenAddress = getTokenAddress(transactionData.token.asset)
  const isTokenNative = isNativeToken(transactionData.token.asset)
  const tokenChain = getTokenChain(transactionData.token.asset)
  const tokenChainReference = getTokenChainReference(
    transactionData.token.asset
  )

  const chainWallet =
    wallets[chainMapping[tokenChain + ':' + tokenChainReference]]
  const receiverAddress = transactionData.address

  let txString
  let txData
  let txIdAlgo

  if (tokenChain === 'near') {
    const near = await initNearClient()
    const nearAccount = await near.account(chainWallet.address)
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
      from: chainWallet.address,
      token: transactionData.token,
      chain: tokenChain,
    }
  } else if (tokenChain === 'eip155') {
    let transactionParams = getTransactionParamsData(state)

    const request = await walletProviderApi.post('transaction/nonce', {
      userAddress: chainWallet.address,
      asset: transactionData.token.asset,
    })

    let transaction
    if (isTokenNative) {
      transaction = {
        to: receiverAddress, // faucet address to return eth
        value: amount,
        gas: transactionParams.fee,
        // maxFeePerGas: estimateGas,
        // maxPriorityFeePerGas: estimateGas,
        nonce: request.data.data,
      }
    } else {
      let fromAddress = chainWallet.address
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
        data: contract.methods.transfer(receiverAddress, amount).encodeABI(),
        nonce: request.data.data,
      }
    }

    const signedTransaction = await web3.eth.accounts.signTransaction(
      transaction,
      chainWallet.privateKey.substring(2, chainWallet.privateKey.length)
    )

    txString = signedTransaction.rawTransaction

    txData = {
      amount: amount,
      to: receiverAddress,
      from: chainWallet.address,
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
        chainWallet.address,
        receiverAddress,
        parseInt(amount.toHexString(), 16),
        undefined,
        undefined,
        transactionParams
      )
    } else {
      transaction = algosdk.makeAssetTransferTxnWithSuggestedParams(
        chainWallet.address,
        isAssetEnablingTransaction ? chainWallet.address : receiverAddress,
        undefined,
        undefined,
        isAssetEnablingTransaction ? 0 : parseInt(amount.toHexString(), 16),
        undefined,
        parseInt(tokenAddress, 10),
        transactionParams
      )
    }

    const privateKey = chainWallet.privateKey

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
      from: chainWallet.address,
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
