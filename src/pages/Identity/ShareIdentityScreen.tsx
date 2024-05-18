import React, { useCallback, useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no-implicit-any
import { QRCode } from 'react-native-custom-qr-codes-expo'

import {
  BottomActionBar,
  CopyToClipboardButton,
  ScreenWrapper,
  ShareButton,
  Typography,
} from '~/components'
import { selectSelectedAccount } from '~/features/identities'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

const VeridaLogo = require('assets/vault-logo.png')

const { width: screenWidth } = Dimensions.get('screen')

// Size of the QR code container based on the screen width
const qrCodeContainerSize = screenWidth * 0.7

// Size of the QR code based on its container
const qrCodeSize = qrCodeContainerSize * 0.9

export type ShareIdentityScreenParams = undefined

type ShareIdentityScreenProps = MainStackScreenProps<'ShareIdentity'>

export const ShareIdentityScreen: React.FunctionComponent<
  ShareIdentityScreenProps
> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Share Identity',
    })
  }, [navigation])

  const styles = useThemeAwareStyle(createStyles)

  const handleClose = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const selectedAccount = useAppSelector(selectSelectedAccount)

  const sharedContent = selectedAccount?.did ? selectedAccount?.did : ''
  // TODO: Handle when there is no content to share

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.qrContainer}>
            {sharedContent ? (
              <QRCode
                content={sharedContent}
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
              ellipsizeMode='tail'>
              {sharedContent}
            </Typography>
          </View>
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonWrapper}>
              <CopyToClipboardButton content={sharedContent} />
              <Typography variant='bodySemiBold'>Copy</Typography>
            </View>
            <View style={styles.buttonWrapper}>
              <ShareButton content={sharedContent} />
              <Typography variant='bodySemiBold'>Share</Typography>
            </View>
          </View>
        </View>
      </View>
      <BottomActionBar
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
