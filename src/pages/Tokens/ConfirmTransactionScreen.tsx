import { BigNumber } from 'ethers'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { BottomActionBar, ScreenWrapper } from '~/components'
import { NumericCryptoMaxTransactionFee } from '~/components/Span'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import { ChainMetadata } from '~/features/caip'
import {
  AggregateWalletBannerBalance,
  getWalletAddressForChainId,
  useChainIdForResourceParams,
  useLazyConfirmTransaction,
  useMaybeChainMetadataForResource,
  useSelectedMinifiedBlockchainAccounts,
} from '~/features/cryptoWallet'
import { MainStackScreenProps } from '~/navigation/types'

export type ConfirmTransactionScreenParams = {
  readonly amount: number
  readonly toAddress: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly predictedMaxTransactionFee: BigNumber
}

type ConfirmTransactionScreenProps = MainStackScreenProps<'ConfirmTransaction'>

export const ConfirmTransactionScreen: React.FC<
  ConfirmTransactionScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const {
    aggregateWalletBannerBalance,
    amount,
    toAddress,
    predictedMaxTransactionFee,
  } = params

  useEffect(() => {
    navigation.setOptions({
      title: `Send ${aggregateWalletBannerBalance.symbol}`,
    })
  }, [navigation, aggregateWalletBannerBalance])

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
      return (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fee</Text>
          <View style={styles.infoValue}>
            <Text style={styles.valueText}>
              <NumericCryptoMaxTransactionFee
                chainMetadata={chainMetadata}
                predictedMaxTransactionFee={predictedMaxTransactionFee}
                // TODO: When the codebase has settled, let this prop become
                //       optional and internally default to null. It isn't nice
                //       to force callers to explicitly pass falsey values, but
                //       it is helpful to be explicit when performing large
                //       migrations.
                detailedValuation={null}
              />
            </Text>
          </View>
        </View>
      )
    },
    [predictedMaxTransactionFee]
  )

  const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

  const handleCancelButtonPress = useCallback(() => {
    navigation.navigate('SingleCurrency', {
      resource,
      title: aggregateWalletBannerBalance.label,
    })
  }, [navigation, aggregateWalletBannerBalance, resource])

  const handleSendButtonPress = useCallback(async () => {
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
        aggregateWalletBannerBalance,
      })
    }
  }, [
    navigation,
    confirmTransaction,
    amount,
    toAddress,
    aggregateWalletBannerBalance,
  ])

  return (
    <ScreenWrapper>
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
      </View>
      <BottomActionBar
        actionsOrientation='row'
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancelButtonPress,
            variant: 'secondary',
            disabled: loading,
          },
          {
            label: `Send ${aggregateWalletBannerBalance.symbol}`,
            onPress: handleSendButtonPress,
            disabled: loading,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
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
