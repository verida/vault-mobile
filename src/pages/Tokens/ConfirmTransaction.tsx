import { RouteProp } from '@react-navigation/native'
import {
  AggregateWalletBannerBalance,
  getBlockchainNetworkLabel,
  getWalletAddressForAsset,
  getWalletsData,
  useLazyConfirmTransaction,
  useMaybeBlockchainNetwork,
  WalletsData,
} from 'features/cryptoWallet'
import { getTokenUnitName } from 'features/token'
import { Container, Icon } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'
import { RootState } from 'reduxStore/types'

export type ConfirmTransactionRouteProp = RouteProp<
  MainStackParams,
  'ConfirmTransaction'
>

export type ConfirmTransactionScreenProps = {
  readonly amount: number
  readonly toAddress: string
  readonly token: AggregateWalletBannerBalance
}

const ConfirmTransaction = ({ wallets }: { readonly wallets: WalletsData }) => {
  const {
    token: balanceByChainResult,
    amount,
    toAddress,
  } = useParams<ConfirmTransactionScreenProps>()

  const navigation = useMainNavigation()

  const maybeBlockchainNetwork = useMaybeBlockchainNetwork(
    balanceByChainResult.asset.chainId
  )

  const accountAddress = getWalletAddressForAsset(
    balanceByChainResult.asset,
    wallets
  )

  const networkReference = getBlockchainNetworkLabel(maybeBlockchainNetwork)

  const { confirmTransaction, loading } = useLazyConfirmTransaction()

  //const fixed = getSupportedTokenObjectDecimals(
  //  balanceByChainResult.token,
  //  maybeBlockchainNetwork
  //)

  // TODO: Render the transaction fee
  const renderFeeRow = React.useCallback(() => {
    //{transactionParams.fee
    //  ? formatTokenQuantity(
    //      transactionParams.fee,
    //      maybeBlockchainNetwork!.decimal,
    //      fixed
    //    ) + ` ${maybeBlockchainNetwork!.symbol}`
    //  : 'Unknown'}
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Fee</Text>
        <View style={styles.infoValue}>
          <Text
            style={[
              styles.valueText,
              {
                color: 'red',
                fontWeight: 'bold',
                textDecorationLine: 'underline',
              },
            ]}
            children='TODO: Calculate fee!!!'
          />
        </View>
      </View>
    )
  }, [])

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='close' style={{ color: '#000' }} />,
          action: () =>
            navigation.navigate('SingleCurrency', {
              item: balanceByChainResult,
            }),
        }}
        title={`Send ${getTokenUnitName(balanceByChainResult.token)}`}
      />
      <TestnetWarning networkReference={networkReference} />
      {Boolean(maybeBlockchainNetwork) && (
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
                  {balanceByChainResult.label}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quantity</Text>
              <View style={styles.infoValue}>
                <Text style={styles.valueText}>
                  {parseFloat(String(amount)).toFixed(3)}{' '}
                  {getTokenUnitName(balanceByChainResult.token)}
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
            {renderFeeRow()}
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
                    token: balanceByChainResult,
                  })

                  navigation.navigate('TransactionSuccess', {
                    amount,
                    toAddress,
                    token: balanceByChainResult,
                  })
                } catch (error) {
                  navigation.navigate('TransactionFailure', {
                    errorMessage: String(error),
                  })
                }
              }}>
              {/* @ts-expect-error "color" is not a valid prop */}
              <Text style={styles.nextButton} color='primary'>
                Send {getTokenUnitName(balanceByChainResult.token)}
              </Text>
            </Button>
          </View>
        </View>
      )}
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

const mapStateToProps = (state: RootState) => {
  return {
    // TODO: We need to create a hook for this - unfortunately,
    //       `useWalletsData()` already seems to do something different.
    //       We need to make more obvious what this data represents.
    wallets: getWalletsData(state),
  }
}

export default connect(mapStateToProps)(ConfirmTransaction)
