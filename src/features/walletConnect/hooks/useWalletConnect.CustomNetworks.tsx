import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import { useModal } from 'hooks'
import * as React from 'react'
import { Alert } from 'react-native'

import { WalletConnectTransactionRequestModalAdapter } from '../components'
import { walletConnectProposalUnsupportedNetworksToChainMetadatas } from '../utils'

// TODO: make dynamic

export function useWalletConnectCustomNetworks() {
  const { showModal } = useModal()

  const requestAddCustomNetworks = React.useCallback(
    ({
      proposal,
    }: {
      readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
    }) =>
      new Promise<Error | undefined>((resolve) =>
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
              id: 1697306604097911,
              params: {
                chainId: 'eip155:5',
                request: {
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      blockExplorerUrls: [
                        'https://blockscout.com/xdai/mainnet/',
                      ],
                      chainId: '0x64',
                      chainName: 'Gnosis Chain',
                      nativeCurrency: { name: 'xDAI', symbol: 'xDAI' },
                      rpcUrls: ['https://rpc.gnosischain.com/'],
                    },
                  ],
                },
              },
              topic:
                'f2a8a9e27918bb87066419d884ef43306f19cc8a9c1e57290cc3c26bb5a5f2fc',
              verifyContext: {
                verified: {
                  origin: 'https://www.verida.io/',
                  validation: 'UNKNOWN',
                  verifyUrl: '',
                },
              },
            }}
          />
        )
      ),
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

      return requestAddCustomNetworks({
        proposal,
      })
    },
    [requestAddCustomNetworks]
  )

  return { maybeAddCustomNetworksOrErrorAsync }
}
