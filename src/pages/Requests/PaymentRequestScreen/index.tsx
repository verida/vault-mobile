import { BottomActionBar } from 'components'
import {
  CryptoWalletRequest,
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
} from 'features/cryptoWallet'
import { Protocol } from 'features/protocols'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

import { PaymentRequestScreenContainer } from './PaymentRequestScreen.Container'

export interface PaymentRequestScreenParams {
  name: string
  logo?: string
  details: {
    timestamp?: string
    requesterId: string
    message?: string
    url?: string
    protocols: Protocol[]
  }
  data: CryptoWalletRequest<'pay'>
}

type PaymentRequestScreenProps = MainStackScreenProps<'PaymentRequest'>

// TODO: programmatically trigger a payment request
export const PaymentRequestScreen: React.FunctionComponent<PaymentRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const { params } = route
    const { data } = params
    const { resource } = data

    const [maybeAggregateWalletBannerBalance] =
      getAggregateWalletBannerBalanceResult(
        useAggregateWalletBannerBalances({
          resource,
        })
      )

    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    // Set the content of the screen header
    useEffect(() => {
      navigation.setOptions({
        title: 'Payment Request',
        // TODO: Get rid of the following when properly handling a common header in the navigator
        headerRight: () => (
          // TODO: Get rid of native-base when we have proper base components (button, icon, etc.)
          <ButtonNativeBase transparent onPress={handleClose}>
            <IconNativeBase name='close' style={{ color: '#000' }} />
          </ButtonNativeBase>
        ),
      })
    }, [navigation, handleClose])

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
          {maybeAggregateWalletBannerBalance ? (
            <PaymentRequestScreenContainer
              {...params}
              aggregateWalletBannerBalance={maybeAggregateWalletBannerBalance}
              onRequestClose={handleClose}
            />
          ) : (
            <React.Fragment>
              <View style={styles.flex}>
                {/* <SomePrettyMissingAssetAnimation /> */}
              </View>
              <BottomActionBar
                alertType='error'
                alertContent='The requested asset has not been found!'
                actions={[
                  {
                    label: 'Close',
                    onPress: handleClose,
                  },
                ]}
              />
            </React.Fragment>
          )}
        </View>
      </>
    )
  }

// TODO: Use the theme when proper typography is available
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    container: {
      flex: 1,
    },
    containerContent: {
      paddingVertical: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
    },
    flex: { flex: 1 },
  })
