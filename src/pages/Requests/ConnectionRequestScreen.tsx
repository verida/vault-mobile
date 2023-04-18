import { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import { usePolygonId } from 'features/polygonid'
import LottieView from 'lottie-react-native'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import {
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from 'react-native-vector-icons/Feather'

import BlurCircle from 'assets/blur-circle.svg'
import FailureCross from 'assets/failure_cross.svg'
import SuccessTick from 'assets/success_tick.svg'
import AppLogo from 'components/AppLogo'
import Button from 'components/Button'
import { Text } from 'components/Typography/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

// TODO: Make sure the params are generic enough to be used for other types of requests (Verida Connect, WalletConnect, Polygon IDetc.)
export interface ConnectionRequestScreenParams {
  connectionLabel?: string
  connectionLogo?: string
  connectionHostname?: string
  requestDetails: {
    timestamp?: Date // TODO: Consider a string timestamp if issue with non-seriazable data in navigation params
    requesterId?: string
    message?: string
  }
  data: AuthorizationRequestMessage // TODO: Make it multiple types
  // TODO: Add expiry when needed
}

type ConnectionRequestScreenProps = MainStackScreenProps<'ConnectionRequest'>

export const ConnectionRequestScreen: React.FunctionComponent<ConnectionRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const {
      connectionLabel = 'Unknown', // TODO: Define the best placeholder
      connectionLogo,
      connectionHostname,
      requestDetails,
      data,
    } = route.params

    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const { handleAcceptConnectionRequest } = usePolygonId()
    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleConnect = useCallback(async () => {
      setProcessing(true)
      try {
        const successfulResult = await handleAcceptConnectionRequest(data)
        if (successfulResult) {
          setSuccess(true)
        } else {
          setError(true)
        }
      } catch (_error: unknown) {
        setError(true)
      } finally {
        setProcessing(false)
      }
    }, [handleAcceptConnectionRequest, data])

    const handleToggleDetails = useCallback(() => {
      setDetailsOpen((prevValue) => !prevValue)
    }, [])

    useEffect(() => {
      navigation.setOptions({
        title: 'Connection Request',
        // TODO: Get rid of the following when properly handling a common header
        headerShown: true,
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
          <View style={styles.container}>
            {!processing && !error && !success ? (
              <>
                <AppLogo // TODO: Define the best logo placeholder
                  url={connectionLogo || null}
                  style={styles.connectionLogo}
                />
                {connectionHostname ? (
                  <Text style={styles.connectionHostName}>
                    {connectionHostname}
                  </Text>
                ) : null}
                <Text
                  style={
                    styles.connectMessage
                  }>{`Connect with ${connectionLabel}`}</Text>
                <TouchableOpacity
                  onPress={handleToggleDetails}
                  style={styles.requestDetailsButton}>
                  <Text style={styles.requestDetailsButtonLabel}>
                    Request details
                  </Text>
                  <Feather
                    name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    style={styles.requestDetailsButtonLabelIcon}
                  />
                </TouchableOpacity>
                {detailsOpen ? (
                  <View style={styles.requestDetailsContainer}>
                    <View>
                      <Text
                        style={
                          styles.requestDetailsPropertyLabel
                        }>{`Requested on`}</Text>
                      <Text style={styles.requestDetailsPropertyValue}>
                        {(requestDetails.timestamp
                          ? requestDetails.timestamp
                          : new Date()
                        ).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.requestDetailsPropertySpacing}>
                      <Text
                        style={
                          styles.requestDetailsPropertyLabel
                        }>{`Reason`}</Text>
                      <Text style={styles.requestDetailsPropertyValue}>
                        {requestDetails.message || ' '}
                      </Text>
                    </View>
                    <View style={styles.requestDetailsPropertySpacing}>
                      <Text
                        style={
                          styles.requestDetailsPropertyLabel
                        }>{`From`}</Text>
                      <Text style={styles.requestDetailsPropertyValue}>
                        {requestDetails.requesterId || ' '}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <Status
                statusType={
                  processing ? 'processsing' : success ? 'success' : 'error'
                }
                title={
                  processing ? 'Connecting' : success ? 'Success!' : 'Error!'
                }
                subtitle={
                  processing
                    ? 'Please wait a few seconds'
                    : success
                    ? `You successfully connected with ${connectionLabel}`
                    : 'Something went wrong. Try again later.'
                }
              />
            )}
          </View>
          <View style={styles.footer}>
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
                  onPress={handleConnect}
                  disabled={processing}
                  style={[styles.actionButton, styles.ml]}>
                  Connect
                </Button>
              </>
            )}
          </View>
        </View>
      </>
    )
  }

type StatusProps = {
  statusType: 'processsing' | 'error' | 'success'
  title?: string
  subtitle?: string
} & ViewProps

// TODO: Make a proper component out of this
const Status: React.FunctionComponent<StatusProps> = (props) => {
  const { statusType, title, subtitle, ...rest } = props

  const styles = useThemeAwareStyle(createStyles)

  const statusTitle = title
    ? title
    : statusType === 'processsing'
    ? 'Processing'
    : statusType === 'success'
    ? 'Success'
    : 'Error'

  const statusSubtitle = subtitle
    ? subtitle
    : statusType === 'processsing'
    ? 'Please wait'
    : statusType === 'success'
    ? 'Congratulations!'
    : 'Something went wrong!'

  const icon =
    statusType === 'processsing' ? (
      <>
        <BlurCircle />
        {/* TODO: The animation doesn't seem to work */}
        <LottieView
          source={require('assets/animations/dots-loader.json')}
          autoPlay
          loop
          style={styles.dotsLoader}
        />
      </>
    ) : statusType === 'success' ? (
      // TODO: Use an icon and apply it on top of the blue blur background instead of a combine icon + background
      <SuccessTick />
    ) : (
      // TODO: Use an icon and apply it on top of the blue blur background instead of a combine icon + background
      <FailureCross />
    )

  return (
    <View {...rest}>
      <View
        style={{
          alignItems: 'center',
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {icon}
        </View>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>
      </View>
    </View>
  )
}
// TODO: Use the them when proper typography is available
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    container: {
      flex: 1,
      paddingTop: 64,
      paddingHorizontal: theme.spacing.m,
      alignItems: 'center',
    },
    connectionLogo: {
      height: 72,
      aspectRatio: 1 / 1,
      borderRadius: 999999,
    },
    connectionHostName: {
      marginTop: theme.spacing.s,
      fontSize: 14,
      lineHeight: 24,
      fontFamily: NUNITO_SANS_BOLD,
      color: theme.color.textLightGrey,
    },
    connectMessage: {
      marginTop: theme.spacing.sm,
      fontSize: 28,
      lineHeight: 36,
      fontFamily: NUNITO_SANS_BOLD,
    },
    requestDetailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: 999999,
      borderColor: theme.color.lightGrey,
    },
    requestDetailsButtonLabel: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    requestDetailsButtonLabelIcon: {
      marginLeft: theme.spacing.xs,
      color: theme.color.textLightGrey,
    },
    requestDetailsContainer: {
      width: '100%',
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: theme.color.lightGrey,
    },
    requestDetailsPropertyLabel: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    requestDetailsPropertyValue: {
      marginTop: theme.spacing.s,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
    requestDetailsPropertySpacing: {
      marginTop: theme.spacing.l,
    },
    statusTitle: {
      marginTop: theme.spacing.l,
      fontSize: 28,
      lineHeight: 36,
      fontFamily: NUNITO_SANS_BOLD,
    },
    statusSubtitle: {
      marginTop: theme.spacing.m,
      fontSize: 16,
      lineHeight: 24,
      color: theme.color.textLightGrey,
    },
    dotsLoader: {
      width: 48,
      height: 48,
      position: 'absolute',
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.sm,
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
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
