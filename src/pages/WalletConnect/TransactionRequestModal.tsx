import sentry from '@sentry/react-native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  IRequestRenderParams,
  WalletConnectClientMeta,
  WalletConnectRequest,
} from 'wallet-connect/types'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'
import { Spacer } from 'components/Spacer'

import { BLACK_COLOR } from '../../constants/color'
import { NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import { apiEtherPrices } from '../../wallet-connect/helpers/api'

const Row = ({
  leftText,
  rightText,
  ...rest
}: {
  leftText: string
  rightText: string
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
      }}
      {...rest}>
      <Text style={styles.leftText}>{leftText}</Text>
      <Text style={styles.rightText}>{rightText}</Text>
    </View>
  )
}

type Props = {
  client: WalletConnectClientMeta
  payload: WalletConnectRequest
  dismissModal: () => void
  approveRequest: () => void
  rejectRequest: () => void
  renderPayload: (payload: any) => IRequestRenderParams[]
}

const getContractInfo = (param: any) => {
  switch (param.value) {
    case 'personal_sign':
    case 'personal_signTypedData':
      return {
        title: 'Signature Request',
        type: 'SIGNATURE_REQUEST',
      }

    case 'eth_sendTransaction':
      return {
        title: 'Smart Contract Call',
        type: 'CONTRACT_CALL',
      }
    case 'wallet_switchEthereumChain': {
      return {
        title: 'Request change network',
        type: 'CHAIN_SWITCH',
      }
    }
    default:
      return {
        title: 'Smart Contract Call',
        type: 'CONTRACT_CALL',
      }
  }
}

const TransactionRequestModal = (props: Props) => {
  const {
    client: { name, url },
    payload,
    dismissModal,
    approveRequest,
    renderPayload,
  } = props

  const [loading, setLoading] = useState(true)
  const allParams = renderPayload(payload)
  const params: IRequestRenderParams[] = allParams.filter(
    (param) =>
      param.label !== 'Method' &&
      param.label !== 'Value' &&
      param.label !== 'Data' &&
      param.label !== 'Network Fee'
  )
  const contractInfo = getContractInfo(allParams[0])
  const ethValue = allParams.find((param) => param.label === 'Value')
  const networkFee = allParams.find((param) => param.label === 'Network Fee')
  const [etherPriceUsd, setEtherPriceUsd] = useState(0)

  useEffect(() => {
    ;(async () => {
      try {
        if (ethValue && etherPriceUsd === 0) {
          const prices = await apiEtherPrices()
          setEtherPriceUsd(prices.USD)
        }
      } catch (error) {
        sentry.captureException(error)
      }
      setLoading(false)
    })()
  }, [ethValue, etherPriceUsd])

  if (loading) return null

  return (
    <BottomActionsModal title={contractInfo?.title} onClose={dismissModal}>
      <View style={{ minHeight: '90%' }}>
        <View style={{ flex: 1, justifyContent: 'space-around' }}>
          <ScrollView
            style={{ marginBottom: 16 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContainer}>
            {contractInfo.type === 'CONTRACT_CALL' && ethValue ? (
              <>
                <Text style={styles.title}>-{ethValue?.value} ETH</Text>
                {etherPriceUsd ? (
                  <Text style={styles.description}>
                    ≈${etherPriceUsd * Number(ethValue?.value ?? 0)}
                  </Text>
                ) : null}
                <Spacer height={32} />
                <Row leftText={'Asset'} rightText={'Ethereum (ETH)'} />
                <Spacer height={16} />
              </>
            ) : null}
            <Row leftText={'DApp'} rightText={name} />
            {url && <Row leftText={''} rightText={url} />}
            <Spacer height={16} />
            {networkFee && etherPriceUsd > 0 ? (
              <>
                <Row
                  leftText={'Network Fee'}
                  rightText={`${Number(networkFee.value ?? 0)} ETH ($${(
                    Number(networkFee?.value ?? 0) * etherPriceUsd
                  ).toFixed(2)})`}
                />
                <Spacer height={16} />
                <Row
                  leftText={'Max Total'}
                  rightText={`$${(
                    Number(networkFee?.value ?? 0) * etherPriceUsd
                  ).toFixed(2)}`}
                />
                <Spacer height={16} />
              </>
            ) : null}

            {params.map((param) => (
              <>
                <Row
                  key={param.label}
                  leftText={param.label}
                  rightText={param.value}
                />
                <Spacer height={16} />
              </>
            ))}
            <Spacer height={48} />
          </ScrollView>
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.ignoreButton}
            color='grey'
            onPress={dismissModal}>
            Ignore
          </Button>
          <Button
            style={styles.confirmButton}
            color='primary'
            onPress={approveRequest}>
            Confirm
          </Button>
        </View>
      </View>
    </BottomActionsModal>
  )
}

export default TransactionRequestModal

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
    minWidth: '40%',
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
    opacity: 0.5,
  },
  rightText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
})
