import { nanoid } from '@reduxjs/toolkit'
import {
  BottomActionBar,
  RequestHeaderProps,
  useMaybeWalletSelectorButtonProps,
} from 'components'
import {
  CryptoWalletRequest,
  getAggregateWalletBannerBalanceResult,
  getChainIdParamsFromResourceParams,
  useAggregateWalletBannerBalances,
  useMaybeChainMetadataForResource,
} from 'features/cryptoWallet'
import { Protocol } from 'features/protocols'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect } from 'react'
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useImmediateLayoutAnimation } from 'use-layout-animation'

import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

import { PaymentRequestScreenContainer } from './PaymentRequestScreen.Container'
import { PaymentRequestScreenContentBody } from './PaymentRequestScreen.Content.Body'

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

export const PaymentRequestScreen: React.FunctionComponent<
  PaymentRequestScreenProps
> = (props) => {
  const { navigation, route } = props
  const { params } = route
  const { data, name: senderName, logo } = params
  const { resource, amount = NaN } = data

  const integerCryptoAmount = String(amount) as `${number}`

  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)

  // Uniquely identifies a payment request. Can be used to manage
  // synchronization between the display and an incoming payment
  // request, and takes priority over the currently rendered content.
  const paymentRequestId = React.useMemo(nanoid, [params])

  const onToggleDetails = React.useCallback(
    () => setDetailsOpen((prevValue) => !prevValue),
    []
  )

  // TODO: This useAggregateWalletBannerBalances used everywhere doesn't make any sense!
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
    })
  }, [navigation, handleClose])

  const requestHeaderProps: Omit<
    RequestHeaderProps,
    'timestamp' | 'isDetailsOpen'
  > = React.useMemo(
    () => ({
      senderName: senderName,
      avatar: logo || undefined,
      onToggleDetails,
    }),
    [logo, onToggleDetails, senderName]
  )

  const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

  useImmediateLayoutAnimation([paymentRequestId])

  const maybeUnknownAssetWalletSelectorButtonProps =
    useMaybeWalletSelectorButtonProps({
      aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
      resource: getChainIdParamsFromResourceParams(resource),
    })

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
            key={paymentRequestId}
            integerCryptoAmount={integerCryptoAmount}
            aggregateWalletBannerBalance={maybeAggregateWalletBannerBalance}
            onRequestClose={handleClose}
            detailsOpen={detailsOpen}
            requestHeaderProps={requestHeaderProps}
          />
        ) : (
          <React.Fragment>
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.containerContent}>
              <PaymentRequestScreenContentBody
                details={params.details}
                detailsOpen={detailsOpen}
                requestHeaderProps={requestHeaderProps}
                requestPaymentValueProps={{
                  aggregateWalletBannerBalance:
                    maybeAggregateWalletBannerBalance,
                  integerCryptoAmount,
                  chainMetadata: maybeChainMetadata || undefined,
                }}
                // HACK: We cannot determine the transfer fee of an
                //       unknown resource.
                requestPaymentFeeProps={null}
                walletSelectorButtonProps={
                  maybeUnknownAssetWalletSelectorButtonProps
                }
              />
            </ScrollView>
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
