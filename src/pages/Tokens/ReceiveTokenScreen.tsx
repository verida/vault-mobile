import React, { useCallback, useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
// @ts-expect-error missing_declaration
import { QRCode } from 'react-native-custom-qr-codes-expo'

import {
  BottomActionBar,
  CopyToClipboardButton,
  ScreenWrapper,
  ShareButton,
  Typography,
} from '~/components'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
  useSelectedCryptoWallet,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

const VeridaLogo = require('~/assets/vault-logo.png')

const { width: screenWidth } = Dimensions.get('screen')

// Size of the QR code container based on the screen width
const qrCodeContainerSize = screenWidth * 0.7

// Size of the QR code based on its container
const qrCodeSize = qrCodeContainerSize * 0.9

export type ReceiveTokenScreenParams = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

type ReceiveTokenScreenProps = MainStackScreenProps<'ReceiveToken'>

export const ReceiveTokenScreen: React.FC<ReceiveTokenScreenProps> = (
  props
) => {
  const {
    navigation,
    route: { params },
  } = props

  const { aggregateWalletBannerBalance } = params

  useEffect(() => {
    navigation.setOptions({
      title: `Receive ${aggregateWalletBannerBalance.symbol}`,
    })
  }, [navigation, aggregateWalletBannerBalance])

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

  const handleClose = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper isModal>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.qrContainer}>
            {hasAddress ? (
              <QRCode
                content={address}
                size={qrCodeSize}
                logo={VeridaLogo}
                logoSize={qrCodeSize * 0.3}
                codeStyle='dot'
                innerEyeStyle='circle'
              />
            ) : null}
          </View>
          <View style={styles.sharedContentContainer}>
            <Typography
              variant='bodySemiBold'
              numberOfLines={1}
              ellipsizeMode='middle'>
              {address}
            </Typography>
          </View>
          {hasAddress ? (
            <View style={styles.buttonsContainer}>
              <View style={styles.buttonWrapper}>
                <CopyToClipboardButton content={address} />
                <Typography variant='bodySemiBold'>Copy</Typography>
              </View>
              <View style={styles.buttonWrapper}>
                <ShareButton content={address} />
                <Typography variant='bodySemiBold'>Share</Typography>
              </View>
            </View>
          ) : null}
        </View>
      </View>
      <BottomActionBar
        alertType='warning'
        alertContent={`Send only ${aggregateWalletBannerBalance.label} (${aggregateWalletBannerBalance.symbol}) to this address. Sending any other coins may result in permanent loss.`}
        actions={[
          {
            label: 'Close',
            onPress: handleClose,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      width: qrCodeContainerSize,
    },
    qrContainer: {
      width: qrCodeContainerSize,
      height: qrCodeContainerSize,
      borderRadius: theme.roundness.l,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.color.background,
      shadowColor: theme.color.black,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      elevation: 3,
    },
    sharedContentContainer: {
      marginTop: theme.spacing.l,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.m,
      borderRadius: theme.roundness.l,
      backgroundColor: theme.color.primary5,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: theme.spacing.l,
    },
    buttonWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
  })
