import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { NearSigningMethod } from 'features/near'
import { transactions } from 'near-api-js/lib'
import * as React from 'react'

const formatTransaction = (transaction: Uint8Array) => {
  const tx = transactions.Transaction.decode(Buffer.from(transaction))

  return {
    signerId: tx.signerId,
    receiverId: tx.receiverId,
    publicKey: tx.publicKey.toString(),
    actions: tx.actions.map((action) => {
      switch (action.enum) {
        case 'createAccount': {
          return {
            type: 'CreateAccount',
            params: action.createAccount,
          }
        }
        case 'deployContract': {
          return {
            type: 'DeployContract',
            params: {
              ...action.deployContract,
              args: Buffer.from(action.deployContract.code).toString(),
            },
          }
        }
        case 'functionCall': {
          return {
            type: 'FunctionCall',
            params: {
              ...action.functionCall,
              args: JSON.parse(
                Buffer.from(action.functionCall.args).toString()
              ),
            },
          }
        }
        case 'transfer': {
          return {
            type: 'Transfer',
            params: action.transfer,
          }
        }
        case 'stake': {
          return {
            type: 'Stake',
            params: {
              ...action.stake,
              publicKey: action.stake.publicKey.toString(),
            },
          }
        }
        case 'addKey': {
          return {
            type: 'AddKey',
            params: {
              ...action.addKey,
              publicKey: action.addKey.publicKey.toString(),
            },
          }
        }
        case 'deleteKey': {
          return {
            type: 'DeleteKey',
            params: {
              ...action.deleteKey,
              publicKey: action.deleteKey.publicKey.toString(),
            },
          }
        }
        case 'deleteAccount': {
          return {
            type: 'DeleteAccount',
            params: action.deleteAccount,
          }
        }
        default:
          return {
            type: action.enum,
            params: undefined, //action[action.enum],
          }
      }
    }),
  }
}

export function useWalletConnectDataFormattingNearLike() {
  return React.useCallback(
    (params: Web3WalletTypes.EventArguments['session_request']['params']) => {
      switch (params.request.method) {
        case NearSigningMethod.NEAR_SIGN_TRANSACTION:
          return {
            ...params,
            request: {
              ...params.request,
              params: {
                ...params.request.params,
                transaction: formatTransaction(
                  params.request.params.transaction
                ),
              },
            },
          }
        case NearSigningMethod.NEAR_SIGN_TRANSACTIONS:
          return {
            ...params,
            request: {
              ...params.request,
              params: {
                ...params.request.params,
                transactions:
                  params.request.params.transactions.map(formatTransaction),
              },
            },
          }
        default:
          return params
      }
    },
    []
  )
}
