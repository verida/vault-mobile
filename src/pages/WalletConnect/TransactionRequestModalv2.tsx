import * as Sentry from '@sentry/react-native'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { transactions } from 'near-api-js'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import JSONTree from 'react-native-json-tree'
import {
  NEAR_CHAINS,
  NEAR_SIGNING_METHODS,
  TNearChain,
} from 'wallet-connect/data/NEARData'
import {
  approveNearRequest,
  rejectNearRequest,
} from 'wallet-connect/helpers/NearRequestHandler'
import { getWC2SignClient } from 'wallet-connect/helpers/wallet2'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'
import { Spacer } from 'components/Spacer'
import ProjectInfoCard from 'components/WalletConnect/ProjectInfoCard'

import { BLACK_COLOR } from '../../constants/color'
import { NUNITO_SANS_SEMIBOLD } from '../../constants/text'

// TODO: Refactor. Testing JSON tree view styling
const themeFlat = {
  scheme: 'default',
  base00: '#181818',
  base01: '#282828',
  base02: '#383838',
  base03: '#585858',
  base04: '#b8b8b8',
  base05: '#d8d8d8',
  base06: '#e8e8e8',
  base07: '#f8f8f8',
  base08: '#ab4642',
  base09: '#dc9656',
  base0A: '#f7ca88',
  base0B: '#a1b56c',
  base0C: '#86c1b9',
  base0D: '#7cafc2',
  base0E: '#ba8baf',
  base0F: '#a16946',
  tree: {
    flexDirection: 'column',
    padding: 2,
    backgroundColor: '#f8f8f8',
  },
  nestedNode: {},
  rootNode: {},
  rootNodeChildren: {},
  valueLabel: {},
  value: {
    flexWrap: 'wrap',
    // justifyContent: 'space-between',
    marginBottom: 2,
  },
  valueText: {
    marginBottom: 6,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
}

const Row = ({
  leftText,
  rightText,
  ...rest
}: {
  leftText: string
  rightText: string | Record<string, unknown>
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
      }}
      {...rest}>
      <Text style={styles.leftText}>{leftText}</Text>
      {typeof rightText === 'string' ? (
        <Text style={styles.rightText}>{rightText}</Text>
      ) : (
        <View style={styles.rightJsonView}>
          <JSONTree
            theme={{ extend: themeFlat as any }}
            invertTheme
            hideRoot={false}
            keyPath={['Object']}
            shouldExpandNode={() => true}
            data={rightText}
            labelRenderer={(raw) => {
              return <Text style={{ maxWidth: '20%' }}>{raw[0]}</Text>
            }}
            valueRenderer={(raw) => (
              <Text
                style={{ flex: 1, textAlign: 'left' }}
                ellipsizeMode='middle'>
                {raw}
              </Text>
            )}
          />
        </View>
      )}
    </View>
  )
}

type Props = {
  requestEvent?: SignClientTypes.EventArguments['session_request']
  requestSession?: SessionTypes.Struct
  dismissModal: () => void
}

const TransactionRequestModalv2 = (props: Props) => {
  // Get request and wallet data from store
  const { requestEvent, requestSession, dismissModal } = props
  const [loading, setLoading] = useState(false)

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required request data
  const { topic, params } = requestEvent
  const { request, chainId } = params

  const metadata = requestSession.peer.metadata

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

  const formatParams = () => {
    switch (params.request.method) {
      case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTION:
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
      case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTIONS:
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

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      try {
        setLoading(true)
        const response = await approveNearRequest(requestEvent)
        const signClient = await getWC2SignClient()
        await signClient.respond({
          topic,
          response,
        })
        dismissModal()
      } catch (error) {
        Sentry.captureException(error)
        Alert.alert('Error', 'Unable to process request')
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      try {
        setLoading(true)
        const response = rejectNearRequest(requestEvent)
        const signClient = await getWC2SignClient()
        await signClient.respond({
          topic,
          response,
        })
      } catch (error) {
        Sentry.captureException(error)
        Alert.alert('Error', 'Unable to reject request')
      } finally {
        dismissModal()
      }
    }
  }

  return (
    <BottomActionsModal title={'Smart Contract Call'} onClose={onReject}>
      <View style={{ minHeight: '90%' }}>
        <View
          style={{ flex: 1, justifyContent: 'space-around', width: '100%' }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContainer}>
            <ProjectInfoCard metadata={metadata} />
            <Spacer height={16} />

            <Row
              leftText={'Blockchain(s)'}
              rightText={[chainId]
                .map(
                  (chain: string) =>
                    NEAR_CHAINS[chain as TNearChain]?.name ?? chain
                )
                .join(', ')}
            />
            <Spacer height={8} />
            <Row
              leftText={'Relay Protocol'}
              rightText={requestSession.relay.protocol}
            />

            <Spacer height={12} />

            <Row leftText={'Data'} rightText={formatParams()} />

            <Spacer height={12} />

            <Row
              leftText={'Methods'}
              rightText={[request.method].map((method) => method).join(', ')}
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

export default TransactionRequestModalv2

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
