import { Protocol } from 'features/protocols'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Button from 'components/Button'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

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
  data: Record<string, unknown>
}

type PaymentRequestScreenProps = MainStackScreenProps<'PaymentRequest'>

export const PaymentRequestScreen: React.FunctionComponent<PaymentRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const { name, logo, details, data } = route.params

    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(false)
    const [erroMessage, setErrorMessage] = useState<string | undefined>()
    const [success, setSuccess] = useState(false)
    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handlePay = useCallback(() => {
      // TODO: To inmplement
    }, [])

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
          <ScrollView>
            <Text>Payment Request</Text>
            <Text>{JSON.stringify(data)}</Text>
          </ScrollView>
          <View style={styles.footer}>
            <View style={styles.footerActionsContainer}>
              {/* TODO: Ensure the buttons have a background */}
              {processing || error || success ? (
                <>
                  <Button
                    onPress={handleClose}
                    style={styles.actionButton}
                    disabled={processing}>
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onPress={handleClose}
                    color='grey'
                    disabled={processing}
                    style={[styles.actionButton, styles.mr]}>
                    Decline
                  </Button>
                  <Button
                    onPress={handlePay}
                    disabled={processing}
                    style={[styles.actionButton, styles.ml]}>
                    Pay
                  </Button>
                </>
              )}
            </View>
          </View>
        </View>
      </>
    )
  }

// TODO: Use the them when proper typography is available
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    // container: {
    //   flex: 1,
    // },
    // containerContent: {
    //   paddingTop: 64,
    //   paddingBottom: theme.spacing.m,
    //   paddingHorizontal: theme.spacing.m,
    //   alignItems: 'center',
    // },
    // logo: {
    //   height: 72,
    //   aspectRatio: 1 / 1,
    //   borderRadius: 999999,
    // },
    // url: {
    //   marginTop: theme.spacing.s,
    //   fontSize: 14,
    //   lineHeight: 24,
    //   fontFamily: NUNITO_SANS_BOLD,
    //   color: theme.color.textLightGrey,
    // },
    // connectMessage: {
    //   marginTop: theme.spacing.sm,
    //   fontSize: 28,
    //   lineHeight: 36,
    //   fontFamily: NUNITO_SANS_BOLD,
    // },
    // message: {
    //   width: '100%',
    //   marginTop: theme.spacing.m,
    //   padding: theme.spacing.m,
    //   backgroundColor: '#F5F4FF',
    //   borderRadius: theme.roundness.xs,
    // },
    // detailsButton: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   marginTop: theme.spacing.m,
    //   paddingVertical: theme.spacing.xs,
    //   paddingHorizontal: theme.spacing.sm,
    //   borderWidth: 1,
    //   borderRadius: 999999,
    //   borderColor: theme.color.lightGrey,
    // },
    // detailsButtonLabel: {
    //   fontSize: 14,
    //   lineHeight: 22,
    //   fontFamily: NUNITO_SANS_SEMIBOLD,
    //   color: theme.color.textLightGrey,
    // },
    // detailsButtonLabelIcon: {
    //   marginLeft: theme.spacing.xs,
    //   color: theme.color.textLightGrey,
    // },
    // detailsContainer: {
    //   width: '100%',
    //   marginTop: theme.spacing.sm,
    //   paddingHorizontal: theme.spacing.m,
    //   paddingVertical: theme.spacing.sm,
    //   borderWidth: 1,
    //   borderRadius: 4,
    //   borderColor: theme.color.lightGrey,
    // },
    // detailsPropertyLabel: {
    //   fontSize: 14,
    //   lineHeight: 22,
    //   fontFamily: NUNITO_SANS_SEMIBOLD,
    //   color: theme.color.textLightGrey,
    // },
    // detailsPropertyValue: {
    //   marginTop: theme.spacing.s,
    //   fontSize: 14,
    //   lineHeight: 22,
    //   fontFamily: NUNITO_SANS_SEMIBOLD,
    // },
    // detailsPropertySpacing: {
    //   marginTop: theme.spacing.l,
    // },
    // statusContainer: {
    //   marginTop: 40,
    // },
    footer: {
      backgroundColor: theme.color.background,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
    },
    // footerAlert: {
    //   marginBottom: theme.spacing.sm,
    // },
    // footerAlertContent: {
    //   flexDirection: 'row',
    // },
    footerActionsContainer: {
      flexDirection: 'row',
    },
    actionButton: {
      flex: 1,
      marginBottom: 0,
    },
    mr: {
      marginRight: 10,
    },
    ml: {
      marginLeft: 10,
    },
  })
