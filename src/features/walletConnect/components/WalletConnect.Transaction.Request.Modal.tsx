import Sentry from '@sentry/react-native'
import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { NearSigningMethod } from 'features/near'
import {
  ActiveSession,
  useWalletConnectSessionApproveCallback,
  useWalletConnectSessionRejectCallback,
  WALLETCONNECT_SUPPORTED_CHAINS,
  WalletConnectSessionInfoCard,
  WalletConnectSessionRequestCallbackParams,
  WalletConnectTransactionRequestModalRow,
} from 'features/walletConnect'
import { useModal } from 'hooks'
import { transactions } from 'near-api-js/lib'
import * as React from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'
import { Spacer } from 'components/Spacer'
import { BLACK_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

// TODO: This is near specific
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

// TODO: make conditional for different blockchains
const formatParams = (
  params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
) => {
  switch (params.request.method) {
    case NearSigningMethod.NEAR_SIGN_TRANSACTION:
      return {
        ...params,
        request: {
          ...params.request,
          params: {
            ...params.request.params,
            transaction: formatTransaction(params.request.params.transaction),
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
}

export const WalletConnectTransactionRequestModal = React.memo(
  function WalletConnectTransactionRequestModal({
    web3wallet,
    request,
    activeSession,
  }: WalletConnectSessionRequestCallbackParams & {
    readonly activeSession: ActiveSession
  }): JSX.Element {
    const { dismissModal } = useModal()
    const [loading, setLoading] = React.useState<boolean>(false)

    const shouldApprove = useWalletConnectSessionApproveCallback()
    const shouldReject = useWalletConnectSessionRejectCallback()

    const onApprove = React.useCallback(async () => {
      if (!request) return

      try {
        setLoading(true)

        await shouldApprove(web3wallet, request)

        dismissModal()
      } catch (e) {
        Sentry.captureException(e)
        Alert.alert(
          'Error',
          `Unable to process request${
            e instanceof Error ? `: ${e.message}` : '.'
          }`
        )
      } finally {
        setLoading(false)
      }
    }, [dismissModal, request, shouldApprove, web3wallet])

    const onReject = React.useCallback(async () => {
      if (!request) return

      try {
        setLoading(true)

        await shouldReject(web3wallet, request, 'User rejected the request')
      } catch (e) {
        Sentry.captureException(e)
        Alert.alert('Error', 'Unable to reject request.')
      } finally {
        setLoading(false)

        dismissModal()
      }
    }, [request, shouldReject, web3wallet, dismissModal])

    const chainId = request.params.chainId

    const maybeRelayProtocol = activeSession?.relay?.protocol

    // TODO: dedicated function
    const maybeSupportedChain = Object.values(
      WALLETCONNECT_SUPPORTED_CHAINS
    ).find(
      ({ chainId: maybeMatchingChainId }) => maybeMatchingChainId === chainId
    )

    const maybeChainName = maybeSupportedChain?.name

    if (!activeSession || !web3wallet || !request)
      // eslint-disable-next-line react/no-children-prop
      return <Text children='Missing request data' />

    return (
      <BottomActionsModal
        title={'Smart Contract Call'}
        onClose={loading ? dismissModal : onReject}>
        <View style={{ minHeight: '90%' }}>
          <View
            style={{ flex: 1, justifyContent: 'space-around', width: '100%' }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <WalletConnectSessionInfoCard
                maybeActiveSession={activeSession}
              />
              <Spacer height={16} />

              {typeof maybeChainName === 'string' &&
                Boolean(maybeChainName.length) && (
                  <>
                    <WalletConnectTransactionRequestModalRow
                      left='Blockchain'
                      right={maybeChainName}
                    />
                    <Spacer height={8} />
                  </>
                )}

              {typeof maybeRelayProtocol === 'string' &&
                Boolean(maybeRelayProtocol.length) && (
                  <>
                    <WalletConnectTransactionRequestModalRow
                      left='Relay Protocol'
                      right={maybeRelayProtocol}
                    />
                    <Spacer height={12} />
                  </>
                )}

              <WalletConnectTransactionRequestModalRow
                left='Data'
                right={formatParams(request)}
              />

              <Spacer height={12} />

              <WalletConnectTransactionRequestModalRow
                left={'Method'}
                right={request.params.request.method}
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
