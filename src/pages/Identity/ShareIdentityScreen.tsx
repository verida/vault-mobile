import { BottomActionBar } from 'components'
import { selectSelectedAccount } from 'features/identities'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect } from 'react'
import { Dimensions, StatusBar, StyleSheet, View } from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no-implicit-any
import { QRCode } from 'react-native-custom-qr-codes-expo'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PROFILE_URL } from 'constants/url'
import { MainStackScreenProps } from 'navigation/types'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const VeridaLogo = require('assets/vault-logo.png')

const { width: screenWidth } = Dimensions.get('screen')

// Size of the QR code container based on the screen width
const qrCodeContainerSize = screenWidth * 0.7

// Size of the QR code based on its container
const qrCodeSize = qrCodeContainerSize * 0.9

export type ShareIdentityScreenParams = undefined

type ShareIdentityScreenProps = MainStackScreenProps<'ShareIdentity'>

export const ShareIdentityScreen: React.FunctionComponent<ShareIdentityScreenProps> =
  (props) => {
    const { navigation } = props

    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    useEffect(() => {
      navigation.setOptions({
        title: 'Share your Identity',
        // TODO: Get rid of the following when properly handling a common header in the navigator
        headerRight: () => (
          // TODO: Get rid of native-base when we have proper base components (button, icon, etc.)
          <ButtonNativeBase transparent onPress={handleClose}>
            <IconNativeBase name='close' style={{ color: '#000' }} />
          </ButtonNativeBase>
        ),
      })
    }, [navigation, handleClose])

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const shareContent = selectedAccount?.did
      ? PROFILE_URL + selectedAccount?.did
      : ''
    // TODO: Handle when there is no content to share

    return (
      <>
        <StatusBar barStyle='light-content' />
        <View
          style={[
            styles.wrapper,
            {
              paddingBottom: insets.bottom,
              paddingRight: insets.right,
              paddingLeft: insets.left,
            },
          ]}>
          <View style={styles.container}>
            <View>
              <View style={styles.qr}>
                {Boolean(shareContent) && (
                  <QRCode
                    content={shareContent}
                    size={qrCodeSize}
                    logo={VeridaLogo}
                    logoSize={qrCodeSize * 0.3}
                    codeStyle='dot'
                    innerEyeStyle='circle'
                  />
                )}
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
        </View>
      </>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qr: {
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
  })
