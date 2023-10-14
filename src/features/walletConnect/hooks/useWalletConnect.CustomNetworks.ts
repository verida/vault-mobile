import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import * as React from 'react'
import { Alert } from 'react-native'

import { walletConnectProposalUnsupportedNetworksToChainMetadatas } from '../utils'

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

      // Attempt to create the corresponding ChainMetadatas for the unsupported networks.
      const chainMetadatasToCreate =
        walletConnectProposalUnsupportedNetworksToChainMetadatas({
          currentlyUnsupportedChainIds,
          proposal,
        })

      const maybeProposerName = proposal?.params?.proposer?.metadata?.name

      const proposer =
        typeof maybeProposerName === 'string' && maybeProposerName.length
          ? `"${maybeProposerName}"`
          : 'This DApp'

      // If we weren't able to recreate all of the required ChainMetadatas, then we cannot continue.
      if (
        chainMetadatasToCreate.length !== currentlyUnsupportedChainIds.length
      ) {
        return new Error(
          `Sorry, ${proposer} depends upon blockchain protocols which not fully supported. (${currentlyUnsupportedChainIds
            .map(String)
            .join(', ')})`
        )
      }

      const count = currentlyUnsupportedChainIds.length

      // Else, prompt the user that the connected dapp wishes to add some networks.
      const userWouldLikeToContinue = await new Promise<boolean>((resolve) =>
        Alert.alert(
          'Network Request',
          `${proposer} would like to save ${
            count === 1 ? 'a' : String(count)
          } new blockchain network${
            count > 1 ? 's' : ''
          } to your Verida Account.`,
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

      // TODO: Prompt the user to save the network settings.
      // eslint-disable-next-line no-console
      console.warn('Did not save network settings!')

      return undefined
    },
    []
  )

  return { maybeAddCustomNetworksOrErrorAsync }
}
