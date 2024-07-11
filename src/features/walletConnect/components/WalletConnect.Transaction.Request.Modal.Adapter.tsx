import { CoreTypes } from '@walletconnect/types'
import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import * as React from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import BottomActionsModal from '~/components/BottomActionsModal'
import Button from '~/components/Button'
import { Spacer } from '~/components/Spacer'
import { BLACK_COLOR } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import {
  getMaybeChainMetadatas,
  useChainMetadatas,
} from '~/features/blockchain'
import { Eip155RpcMethod } from '~/features/blockchain/eip155'
import { getMaybeChainMetadataByCaipChainId } from '~/features/caip'
import { Logger } from '~/features/telemetry'
import { useModal } from '~/hooks'

import { useWalletConnectDataFormatting } from '../hooks'
import { WalletConnectSessionInfoCard } from './WalletConnect.Session.InfoCard'
import { WalletConnectTransactionRequestModalRow } from './WalletConnect.Transaction.Request.Modal.Row'

const isAddEthereumChainRequest = (request: Web3WalletTypes.SessionRequest) =>
  request?.params?.request?.method === Eip155RpcMethod.ADD_ETHEREUM_CHAIN

const getTitleForRequest = (request: Web3WalletTypes.SessionRequest) => {
  if (isAddEthereumChainRequest(request)) return 'Add Network'

  return 'Smart Contract Call'
}

const logger = Logger.create('WalletConnect')

export const WalletConnectTransactionRequestModalAdapter = React.memo(
  function WalletConnectTransactionRequestModalAdapter({
    peerMetadata: maybePeerMetadata,
    request,
    relayProtocols,
    onRequestApprove,
    onRequestReject,
  }: {
    readonly peerMetadata: CoreTypes.Metadata | null | undefined
    readonly relayProtocols: readonly string[]
    readonly request: Web3WalletTypes.EventArguments['session_request']
    readonly onRequestApprove: () => Promise<void>
    readonly onRequestReject: () => Promise<void>
  }): JSX.Element {
    const { dismissModal } = useModal()
    const [loading, setLoading] = React.useState<boolean>(false)

    const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

    const { formatTransactionData } = useWalletConnectDataFormatting()

    const onApprove = React.useCallback(async () => {
      if (!request) return

      try {
        setLoading(true)

        await onRequestApprove()

        dismissModal()
      } catch (error) {
        logger.error(error)
        Alert.alert(
          'Error',
          `Unable to process request${
            error instanceof Error ? `: ${error.message}` : '.'
          }`
        )
      } finally {
        setLoading(false)
      }
    }, [dismissModal, onRequestApprove, request])

    const onReject = React.useCallback(async () => {
      if (!request) return

      try {
        setLoading(true)

        await onRequestReject()
      } catch (error) {
        logger.error(error)
        Alert.alert('Error', 'Unable to reject request.')
      } finally {
        setLoading(false)

        dismissModal()
      }
    }, [dismissModal, onRequestReject, request])

    const chainId = new ChainId(request.params.chainId)

    //const maybeRelayProtocol = activeSession?.relay?.protocol

    const maybeSupportedChain = getMaybeChainMetadataByCaipChainId(
      chainMetadatas,
      chainId
    )

    const maybeChainName = maybeSupportedChain?.name

    if (!request) return <Text children='Missing request data' />

    /// HACK: When requesting to add another network, it does not make sense
    //        to render the current network.
    const shouldRenderNetwork = !isAddEthereumChainRequest(request)

    return (
      <BottomActionsModal
        title={getTitleForRequest(request)}
        onClose={loading ? dismissModal : onReject}>
        <View style={{ minHeight: '90%' }}>
          <View
            style={{ flex: 1, justifyContent: 'space-around', width: '100%' }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <WalletConnectSessionInfoCard peerMetadata={maybePeerMetadata} />
              <Spacer height={16} />

              <WalletConnectTransactionRequestModalRow
                left={'Method'}
                right={request.params.request.method}
              />

              <Spacer height={12} />

              {typeof maybeChainName === 'string' &&
                Boolean(maybeChainName.length) &&
                shouldRenderNetwork && (
                  <>
                    <WalletConnectTransactionRequestModalRow
                      left='Blockchain'
                      right={maybeChainName}
                    />
                    <Spacer height={8} />
                  </>
                )}

              {relayProtocols.map((relayProtocol, i) => (
                <React.Fragment key={String(i)}>
                  <WalletConnectTransactionRequestModalRow
                    left='Relay Protocol'
                    right={relayProtocol}
                  />
                  <Spacer height={12} />
                </React.Fragment>
              ))}

              <WalletConnectTransactionRequestModalRow
                left='Data'
                right={formatTransactionData({ request })}
              />

              <Spacer height={48} />
            </ScrollView>
          </View>
          <View style={styles.footer}>
            <Button style={styles.ignoreButton} color='grey' onPress={onReject}>
              Reject
            </Button>
            <Button
              style={styles.confirmButton}
              color='primary'
              onPress={onApprove}>
              Approve
            </Button>
          </View>
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator size={'large'} />
            </View>
          )}
        </View>
      </BottomActionsModal>
    )
  }
)

const styles = StyleSheet.create({
  scrollViewContainer: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
    opacity: 0.6,
  },
  confirmButton: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    minWidth: 157,
  },
  ignoreButton: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    minWidth: 157,
  },
  leftText: {
    minWidth: '8%',
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
    opacity: 0.5,
  },
  rightText: {
    flex: 9,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  rightJsonView: {
    flex: 9,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    opacity: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
