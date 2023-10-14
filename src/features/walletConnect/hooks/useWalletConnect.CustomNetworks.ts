import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import * as React from 'react'
import { Alert } from 'react-native'

export function useWalletConnectCustomNetworks() {
  const maybeAddCustomNetworksOrErrorAsync = React.useCallback(
    async ({
      currentlyUnsupportedChainIds,
      proposal,
    }: {
      readonly currentlyUnsupportedChainIds: readonly ChainId[]
      readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
    }): Promise<Error | undefined> => {
      // If there are no chains to add, terminate early.
      if (currentlyUnsupportedChainIds.length === 0) return undefined

      // TODO: check if there is an unsupported namespace and fail early

      // TODO: check whether is is possible to synthesize the necessary information

      const maybeProposerName = proposal?.params?.proposer?.metadata?.name

      const proposer =
        typeof maybeProposerName === 'string' && maybeProposerName.length
          ? `"${maybeProposerName}"`
          : 'This DApp'

      const count = currentlyUnsupportedChainIds.length

      // Else, prompt the user that the connected dapp wishes to add some networks.
      const userWouldLikeToContinue = await new Promise<boolean>((resolve) =>
        Alert.alert(
          'Network Request',
          `${proposer} would like to save ${
            count === 1 ? 'a' : String(count)
          } new blockchain network${
            count > 1 ? 's' : ''
          } to your Verida account.`,
          [
            {
              text: 'Reject',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Continue',
              onPress: () => resolve(true),
            },
          ],
          {
            cancelable: false,
          }
        )
      )

      if (!userWouldLikeToContinue)
        return new Error(
          `${proposer} requested access to unsupported networks.`
        )

      console.warn('aye lets go')

      //return new Error(
      //  `Sorry, the following chain${
      //    unsupportedNamespaces.length > 1 ? 's' : ''
      //  } ${
      //    unsupportedNamespaces.length > 1 ? 'are' : 'is'
      //  } not yet supported: ${unsupportedNamespaces.map(String).join(', ')}.`
      //)

      return undefined
    },
    []
  )

  return { maybeAddCustomNetworksOrErrorAsync }
}
