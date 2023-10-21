import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import {
  chainMetadatasToAddEthereumChainRequestParamsOrThrow,
  ChainsList,
  fetchChainsList,
} from 'features/blockchain/eip155'
import { ChainMetadatas } from 'features/caip'
import { useModal } from 'hooks'
import * as React from 'react'
import { Alert } from 'react-native'

import { WalletConnectTransactionRequestModalAdapter } from '../components'
import {
  createWalletConnectVerifyContext,
  mockAddEthereumChainRequest,
  walletConnectProposalUnsupportedNetworksToChainMetadatas,
} from '../utils'

// TODO: make dynamic

export function useWalletConnectCustomNetworks() {
  const { showModal } = useModal()

  const requestAddCustomNetworks = React.useCallback(
    async ({
      chainsList,
      chainMetadatasToCreate: chainMetadatas,
      proposal,
      topic,
    }: {
      readonly chainsList: ChainsList
      readonly chainMetadatasToCreate: ChainMetadatas
      readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
      readonly topic: string
    }) => {
      const addEthereumChainRequestParams =
        chainMetadatasToAddEthereumChainRequestParamsOrThrow({
          chainsList,
          chainMetadatas,
        })

      const mockedAddEthereumChainRequest = mockAddEthereumChainRequest({
        topic,
        chainId: new ChainId('eip155:5'),
        params: addEthereumChainRequestParams,
      })

      // TODO: next, we need to add custom networks

      return new Promise<Error | undefined>((resolve) =>
        showModal(
          <WalletConnectTransactionRequestModalAdapter
            relayProtocols={
              proposal?.params?.relays?.map((e) => e.protocol) || []
            }
            peerMetadata={proposal?.params?.proposer?.metadata}
            onRequestApprove={async () => resolve(undefined)}
            onRequestReject={async () =>
              // TODO: reuse the constant
              resolve(new Error('User rejected the request.'))
            }
            request={{
              id: proposal.id,
              params: mockedAddEthereumChainRequest,
              topic,
              verifyContext: createWalletConnectVerifyContext(),
            }}
          />
        )
      )
    },
    [showModal]
  )

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

      const maybePairingTopic = proposal?.params?.pairingTopic

      if (typeof maybePairingTopic !== 'string' || !maybePairingTopic.length)
        throw new Error(
          `Expected non-empty string pairingTopic, encountered "${String(
            maybePairingTopic
          )}".`
        )

      // TODO: cache the chainsList.
      const chainsList = await fetchChainsList()

      // Attempt to create the corresponding ChainMetadatas for the unsupported networks.
      const chainMetadatasToCreate =
        walletConnectProposalUnsupportedNetworksToChainMetadatas({
          currentlyUnsupportedChainIds,
          proposal,
          chainsList,
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
          `Sorry, ${proposer} depends upon blockchain protocols which aren't fully supported. (${currentlyUnsupportedChainIds
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

      return requestAddCustomNetworks({
        chainsList,
        chainMetadatasToCreate,
        proposal,
        topic: maybePairingTopic,
      })
    },
    [requestAddCustomNetworks]
  )

  return { maybeAddCustomNetworksOrErrorAsync }
}
