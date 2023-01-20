import Common, { Chain } from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx' // const customChainParams = {
import algosdk from 'algosdk'
import sha256 from 'js-sha256'
import * as nearAPI from 'near-api-js'
import { walletProviderApi } from 'wallet/helpers/api'
import {
  getTokenAddress,
  getTokenChain,
  getTokenChainReference,
  isNativeToken,
  parseUnitsForSending,
} from 'wallet/helpers/tokens'
import Web3 from 'web3'

import {
  getTransactionParamsData,
  getWalletsData,
} from 'reduxStore/wallet/selectors'

const web3 = new Web3('http://localhost')

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
  const requestBody = {
    asset: transactionData.token.asset,
  }

  if (getTokenChain(transactionData.token.asset) === 'eip155') {
    const fromAddress = wallets[transactionData.token.addressMapping].address
    const toAddress = transactionData.address

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
        value: '0x0',
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

    requestBody.transactionParameters = input
  }

  const request = await walletProviderApi.post(
    'transaction/params',
    requestBody
  )

  return request.data.data
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
  const tokenChainReference = getTokenChainReference(
    transactionData.token.asset
  )

  const chainWallet = wallets[transactionData.token.addressMapping]
  const receiverAddress = transactionData.address

  let txString
  let txData
  let txIdAlgo

  if (tokenChain === 'near') {
    const prvtKey = chainWallet.privateKey.replace('ed25519:', '')
    const keyPair = nearAPI.utils.key_pair.KeyPairEd25519.fromString(prvtKey)
    const publicKey = keyPair.getPublicKey()

    let transactionParams = getTransactionParamsData(state)

    const request = await walletProviderApi.post('transaction/nonce', {
      userAddress: chainWallet.address,
      asset: transactionData.token.asset,
      publicKey: publicKey.toString(),
    })

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

    const recentBlockHash = nearAPI.utils.serialize.base_decode(
      transactionParams.block_hash
    )

    const nonce = request.data.data

    const transaction = nearAPI.transactions.createTransaction(
      chainWallet.address,
      publicKey,
      txAddress,
      nonce,
      actions,
      recentBlockHash
    )

    const serializedTx = nearAPI.utils.serialize.serialize(
      nearAPI.transactions.SCHEMA,
      transaction
    )

    const serializedTxHash = new Uint8Array(sha256.sha256.array(serializedTx))

    const signature = keyPair.sign(serializedTxHash)

    const signedTransaction = new nearAPI.transactions.SignedTransaction({
      transaction,
      signature: new nearAPI.transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature.signature,
      }),
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
        to: receiverAddress,
        value: amount.toHexString().toString(),
        gasPrice: transactionParams.gasPrice,
        // Hardcoded based on few stackoverflow links and instructions of pranav, doesnt work without.
        gasLimit: '0x13881',
        nonce: request.data.data,
        chainID: tokenChainReference,
      }
    } else {
      let fromAddress = chainWallet.address
      let contract = new web3.eth.Contract(minABI, tokenAddress, {
        from: fromAddress,
      })

      transaction = {
        from: fromAddress,
        gasPrice: transactionParams.gasPrice,
        // Hardcoded based on few stackoverflow links and instructions of pranav, doesnt work without.
        gasLimit: '0x13881',
        to: tokenAddress,
        value: '0x0',
        data: contract.methods
          .transfer(receiverAddress, amount.toHexString().toString())
          .encodeABI(),
        nonce: request.data.data,
        chainID: tokenChainReference,
      }
    }

    let common

    if (tokenChainReference === '4') {
      common = new Common({ chain: Chain.Rinkeby })
    } else {
      common = Common.custom({ chainId: tokenChainReference })
    }

    const tx = Transaction.fromTxData(transaction, { common })

    const privateKey = Buffer.from(
      chainWallet.privateKey.substring(2, chainWallet.privateKey.length),
      'hex'
    )

    const signedTx = tx.sign(privateKey)

    const serializedTx = signedTx.serialize()

    txString = '0x' + serializedTx.toString('hex')

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
      const requestBody = {
        asset: transactionData.token.asset,
      }
      const request = await walletProviderApi.post(
        'transaction/params',
        requestBody
      )
      transactionParams = request.data.data
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
