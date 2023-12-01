import { RouteProp } from '@react-navigation/native'
import { BigNumber } from 'ethers'
import { ChainMetadata } from 'features/caip'
import {
  AggregateWalletBannerBalance,
  getWalletAddressForChainId,
  useChainIdForResourceParams,
  useLazyConfirmTransaction,
  useMaybeChainMetadataForResource,
  useSelectedMinifiedBlockchainAccounts,
} from 'features/cryptoWallet'
import { convertPredictedTransactionFeeToString } from 'features/token/utils/convertPredictedTransactionFeeToString'
import { Container, Icon } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

export type ConfirmTransactionRouteProp = RouteProp<
  MainStackParams,
  'ConfirmTransaction'
>

export type ConfirmTransactionScreenProps = {
  readonly amount: number
  readonly toAddress: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly predictedMaxTransactionFee: BigNumber
}

const ConfirmTransaction = () => {
  const {
    aggregateWalletBannerBalance,
    amount,
    toAddress,
    predictedMaxTransactionFee,
  } = useParams<ConfirmTransactionScreenProps>()

  const navigation = useMainNavigation()

  const { resource } = aggregateWalletBannerBalance

  const chainId = useChainIdForResourceParams({ resource })

  // TODO: what to do about getWalletsData - is it needed any more?
  const selectedMinifiedAccounts = useSelectedMinifiedBlockchainAccounts()

  const accountAddress = getWalletAddressForChainId(
    chainId,
    selectedMinifiedAccounts
  )

  const { confirmTransaction, loading } = useLazyConfirmTransaction()

  const renderFeeRow = React.useCallback(
    (chainMetadata: ChainMetadata) => {
      const { feeAmount, feeSymbol } = convertPredictedTransactionFeeToString({
        chainMetadata,
        predictedMaxTransactionFee,
      })
      return (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fee</Text>
          <View style={styles.infoValue}>
            <Text
              style={styles.valueText}
              children={`${feeAmount} ${feeSymbol}`}
            />
          </View>
        </View>
      )
    },
    [predictedMaxTransactionFee]
  )

  const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='close' style={{ color: '#000' }} />,
          action: () =>
            navigation.navigate('SingleCurrency', {
              resource,
              title: aggregateWalletBannerBalance.label,
            }),
        }}
        title={`Send ${aggregateWalletBannerBalance.symbol}`}
      />
      <TestnetWarning networkReference={maybeChainMetadata?.name} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From</Text>
            <View style={styles.infoValue}>
              <Text
                numberOfLines={1}
                ellipsizeMode='middle'
                style={styles.valueText}>
                {accountAddress}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token</Text>
            <View style={styles.infoValue}>
              <Text style={styles.valueText}>
                {aggregateWalletBannerBalance.label}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <View style={styles.infoValue}>
              <Text style={styles.valueText}>
                {parseFloat(String(amount)).toFixed(3)}{' '}
                {aggregateWalletBannerBalance.symbol}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To</Text>
            <View style={styles.infoValue}>
              <Text
                numberOfLines={1}
                ellipsizeMode='middle'
                style={styles.valueText}
                children={toAddress}
              />
            </View>
          </View>
          {!!maybeChainMetadata && renderFeeRow(maybeChainMetadata)}
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.nextButton}
            color='primary'
            loading={loading}
            onPress={async () => {
              try {
                await confirmTransaction({
                  amount,
                  toAddress,
                  aggregateWalletBannerBalance,
                })

                navigation.navigate('TransactionSuccess', {
                  amount,
                  toAddress,
                  aggregateWalletBannerBalance,
                })
              } catch (error) {
                navigation.navigate('TransactionFailure', {
                  errorMessage: String(error),
                })
              }
            }}>
            {/* @ts-expect-error "color" is not a valid prop */}
            <Text style={styles.nextButton} color='primary'>
              Send {aggregateWalletBannerBalance.symbol}
            </Text>
          </Button>
        </View>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.1)',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  nextButton: {
    alignSelf: 'stretch',
    fontFamily: NUNITO_SANS_BOLD,
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    color: 'rgba(4, 17, 51, 0.5)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
  },
  valueText: {
    color: 'rgba(4, 17, 51, 1)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    textAlign: 'right',
  },
  infoValue: {
    maxWidth: 240,
  },
})

export default ConfirmTransaction
