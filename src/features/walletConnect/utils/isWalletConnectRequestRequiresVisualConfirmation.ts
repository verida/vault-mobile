import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { isValidNearSigningMethod, NearSigningMethod } from 'features/near'

const NEAR_METHODS_REQUIRING_VISUAL_CONFIRMATION: readonly NearSigningMethod[] =
  [
    NearSigningMethod.NEAR_SIGN_IN,
    NearSigningMethod.NEAR_SIGN_OUT,
    NearSigningMethod.NEAR_SIGN_TRANSACTION,
    NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION,
    NearSigningMethod.NEAR_SIGN_TRANSACTIONS,
    NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS,
  ]

export function isWalletConnectRequestRequiresVisualConfirmation(
  request: Web3WalletTypes.EventArguments['session_request']
) {
  const method: string = request.params.request.method

  if (isValidNearSigningMethod(method))
    return NEAR_METHODS_REQUIRING_VISUAL_CONFIRMATION.includes(method)

  // TODO: Ethereum?
  return false
}
