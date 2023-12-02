import {
  BottomActionBar,
  RequestHeaderProps,
  useMaybeWalletSelectorButtonProps,
} from 'components'
import {
  AggregateWalletBannerBalance,
  CryptoWalletRequest,
  getAggregateWalletBannerBalanceResult,
  getChainIdParamsFromResourceParams,
  useAggregateWalletBannerBalances,
  useChainIdForResourceParams,
} from 'features/cryptoWallet'
import { Protocol } from 'features/protocols'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect } from 'react'
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

export const PaymentRequestScreen: React.FunctionComponent<PaymentRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const { params } = route
    const { data, name: senderName, logo } = params
    const { resource, amount } = data

    const integerCryptoAmount = String(amount) as `${number}`

    const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)

    const onToggleDetails = React.useCallback(
      () => setDetailsOpen((prevValue) => !prevValue),
      []
    )

    //const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

    const [maybeAggregateWalletBannerBalanceThatVariesOnRefetch] =
      getAggregateWalletBannerBalanceResult(
        useAggregateWalletBannerBalances({
          resource,
        })
      )

    const [maybeAggregateWalletBannerBalance] = React.useState<
      AggregateWalletBannerBalance | undefined
    >(maybeAggregateWalletBannerBalanceThatVariesOnRefetch)

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

    const chainId = useChainIdForResourceParams({ resource })

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
                    chainId,
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
