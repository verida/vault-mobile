import Clipboard from '@react-native-clipboard/clipboard'
import { RouteProp } from '@react-navigation/native'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
  useSelectedCryptoWallet,
} from 'features/cryptoWallet'
import { Container } from 'native-base'
import React from 'react'
import { Share, StyleSheet, TouchableOpacity, View } from 'react-native'
// @ts-expect-error missing_declaration
import { QRCode } from 'react-native-custom-qr-codes-expo'
import Toast from 'react-native-root-toast'

import CopyIconDark from 'assets/copy_icon_dark.svg'
import ShareIcon from 'assets/share_icon_with_bg.svg'
import Button from 'components/Button'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { BLACK_ORIGIN_COLOR, PRIMARY_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

import LeftArrowIcon from '../../assets/left_arrow_icon.svg'

const LogoImg = require('assets/vault-logo.png')

export type ReceiveTokenRouteProp = RouteProp<MainStackParams, 'ReceiveToken'>

export type ReceiveTokenScreenProps = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

const ReceiveToken = () => {
  const navigation = useMainNavigation()
  const { aggregateWalletBannerBalance } = useParams<ReceiveTokenScreenProps>()

  const { resource } = aggregateWalletBannerBalance

  const resourceChainId = useChainIdForResourceParams({ resource })

  // TODO: Factorise this as it's also implemented in TransactionDetails.tsx and SingleCurrency.tsx
  const selectedCryptoWallet = useSelectedCryptoWallet()
  const accounts = selectedCryptoWallet?.accounts || []
  const account = resourceChainId
    ? accounts.find(
      (accountItem) => accountItem.namespace === resourceChainId.namespace
    )
    : undefined
  const address = account?.address || null

  const hasAddress = typeof address === 'string' && Boolean(address)

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <LeftArrowIcon />,
          action: () => navigation.goBack(),
        }}
        title={`Receive ${aggregateWalletBannerBalance.symbol}`}
      />
      <Layout style={styles.container}>
        <View style={styles.content}>
          {hasAddress && (
            <>
              <Text style={styles.address} children={address} />
              <View style={styles.qr}>
                <QRCode
                  logo={LogoImg}
                  logoSize={60}
                  size={207}
                  codeStyle='dot'
                  innerEyeStyle='circle'
                  padding={0.5}
                  content={address}
                />
              </View>
            </>
          )}

          {/* <Text style={styles.amount}>
            <Text style={styles.cryptoAmount}>5.33 ETH </Text>≈ $10000
          </Text> */}
          <Text style={styles.notice}>
            Send only {aggregateWalletBannerBalance.label}
            {` (${aggregateWalletBannerBalance.symbol})`} to this address.
            Sending any other coins may result in permanent loss.
          </Text>
          <View style={styles.actionButtons}>
            {hasAddress && (
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(address)
                  Toast.show('Address copied', {
                    duration: Toast.durations.LONG,
                    position: -130,
                    shadow: false,
                    animation: true,
                    hideOnPress: true,
                    delay: 0,
                    backgroundColor: 'rgba(4, 17, 51, 1)',
                  })
                }}
                style={styles.actionButton}>
                <CopyIconDark />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
            )}
            {hasAddress && (
              <TouchableOpacity
                onPress={() =>
                  Share.share({
                    message: `My address to receive ${aggregateWalletBannerBalance.symbol} \r${address}`,
                  })
                }
                style={styles.actionButton}>
                <ShareIcon />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.saveButton}
            color='primary'
            onPress={() => navigation.goBack()}>
            Done
          </Button>
        </View>
      </Layout>
    </Container>
  )
}

const styles = StyleSheet.create({
  timer: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  address: {
    fontFamily: NUNITO_SANS_BOLD,
    color: 'rgba(4, 17, 51, 0.6)',
    marginBottom: 24,
    textAlign: 'center',
  },
  qr: {
    width: 240,
    height: 240,
    borderRadius: 12,
    padding: 17,
    backgroundColor: WHITE_COLOR,

    shadowColor: BLACK_ORIGIN_COLOR,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    elevation: 3,
    marginBottom: 24,
  },
  amount: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 24,
  },
  cryptoAmount: {
    fontSize: 16,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  notice: {
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  actionButton: {
    marginHorizontal: 20,
  },
  actionText: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  footer: {},
  saveButton: {},
})

export default ReceiveToken
