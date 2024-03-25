import type { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from 'react-native-vector-icons/Feather'

import { BottomActionBar, StatusInfo } from '~/components'
import AppLogo from '~/components/AppLogo'
import { Text } from '~/components/Typography/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import { usePolygonId } from '~/features/polygonid'
import type { Protocol } from '~/features/protocols'
import { getProtocolLabel, getProtocolLogo } from '~/features/protocols'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

// Make sure the params are generic enough to be used for all types of requests (Verida Connect, WalletConnect, Polygon ID, etc.)
export interface ConnectionRequestScreenParams {
  name: string // TODO: Make it optional and provide a consistent way to representing an unknown requester
  logo?: string
  details: {
    timestamp?: string
    requesterId: string
    message?: string
    url?: string
    protocols: Protocol[]
  }
  data: AuthorizationRequestMessage
  // TODO: Make it multiple types for the different protocols
  // TODO: Add expiry when needed
}

type ConnectionRequestScreenProps = MainStackScreenProps<'ConnectionRequest'>

export const ConnectionRequestScreen: React.FunctionComponent<
  ConnectionRequestScreenProps
> = (props) => {
  const { navigation, route } = props
  const { name, logo, details, data } = route.params

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(false)
  const [erroMessage, setErrorMessage] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { manager: polygonIdManager, isPolygonIdReady } = usePolygonId()
  const styles = useThemeAwareStyle(createStyles)
  const insets = useSafeAreaInsets()

  const polygonIdNotReady =
    details.protocols.includes('polygonid') &&
    (!isPolygonIdReady || !polygonIdManager)

  const processButtonDisabled = processing || polygonIdNotReady

  const handleClose = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleGoToPolygonIdStatus = useCallback(() => {
    handleClose()
    navigation.navigate('PolygonIdStatus')
  }, [handleClose, navigation])

  const handleConnect = useCallback(async () => {
    if (!polygonIdManager) {
      return
    }

    setProcessing(true)
    // TODO: Handle different actions depending on the type of request

    // Doesn't need a try/catch as handled in the function itself
    const { result, error: requestError } =
      await polygonIdManager.processConnectionRequest(data)
    if (result) {
      setSuccess(true)
    } else {
      setError(true)
      setErrorMessage(requestError?.message)
    }
    setProcessing(false)
    // TODO: Handle the case where the user closes the screen before the request is processed
  }, [polygonIdManager, data])

  const handleToggleDetails = useCallback(() => {
    setDetailsOpen((prevValue) => !prevValue)
  }, [])

  useEffect(() => {
    navigation.setOptions({
      title: 'Connection Request',
      // TODO: Get rid of the following when properly handling a common header in the navigator
      headerRight: () => (
        // TODO: Get rid of native-base when we have proper base components (button, icon, etc.)
        <ButtonNativeBase transparent onPress={handleClose}>
          <IconNativeBase name='close' style={{ color: '#000' }} />
        </ButtonNativeBase>
      ),
    })
  }, [navigation, handleClose])

  const protocols = details.protocols
    .map((protocol) => {
      const protocolLogo = getProtocolLogo(protocol, 16)
      const protocolLabel = getProtocolLabel(protocol)
      return (
        <>
          {protocolLogo} {protocolLabel}
        </>
      )
    })
    .reduce((prev, curr) => (
      <>
        {prev}
        {', '}
        {curr}
      </>
    ))

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
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.containerContent}>
          {!processing && !error && !success ? (
            <>
              <AppLogo // TODO: Define the best logo placeholder
                url={logo || null}
                style={styles.logo}
              />
              {details.url ? (
                <Text style={styles.url}>{details.url}</Text>
              ) : null}
              <Text style={styles.connectMessage}>{`Connect to ${name}`}</Text>
              {details.message ? (
                <View style={styles.message}>
                  <Text>{`"${details.message}"`}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                onPress={handleToggleDetails}
                style={styles.detailsButton}>
                <Text style={styles.detailsButtonLabel}>Request details</Text>
                <Feather
                  name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  style={styles.detailsButtonLabelIcon}
                />
              </TouchableOpacity>
              {detailsOpen ? (
                <View style={styles.detailsContainer}>
                  <View>
                    <Text
                      style={
                        styles.detailsPropertyLabel
                      }>{`Requested on`}</Text>
                    <Text style={styles.detailsPropertyValue}>
                      {(details.timestamp
                        ? new Date(details.timestamp)
                        : new Date()
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.detailsPropertySpacing}>
                    <Text style={styles.detailsPropertyLabel}>{`From`}</Text>
                    <Text style={styles.detailsPropertyValue}>
                      {details.requesterId}
                    </Text>
                  </View>
                  <View style={styles.detailsPropertySpacing}>
                    <Text style={styles.detailsPropertyLabel}>{`Via`}</Text>
                    <Text style={styles.detailsPropertyValue}>{protocols}</Text>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <StatusInfo
              style={styles.statusContainer}
              statusType={
                processing ? 'processsing' : success ? 'success' : 'error'
              }
              title={
                processing ? 'Connecting...' : success ? 'Success!' : 'Error!'
              }
              subtitle={
                processing
                  ? 'Please wait a moment, we are securely setting up the connection.'
                  : success
                    ? `You are successfully connected to ${name}.`
                    : erroMessage || 'Something went wrong. Try again later.'
              }
            />
          )}
        </ScrollView>
        <BottomActionBar
          alertType='error'
          alertContent={
            polygonIdNotReady
              ? 'The Polygon ID feature is not ready. Check its status in the Settings and try again.'
              : undefined
          }
          alertOnPress={handleGoToPolygonIdStatus}
          actions={
            processing || error || success
              ? [
                  {
                    label: 'Close',
                    onPress: handleClose,
                  },
                ]
              : [
                  {
                    label: 'Decline',
                    onPress: handleClose,
                    color: 'grey',
                  },
                  {
                    label: 'Connect',
                    onPress: handleConnect,
                    disabled: processButtonDisabled,
                  },
                ]
          }
        />
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
    container: {
      flex: 1,
    },
    containerContent: {
      paddingTop: 64,
      paddingBottom: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      alignItems: 'center',
    },
    logo: {
      height: 72,
      aspectRatio: 1 / 1,
      borderRadius: 999999,
    },
    url: {
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
    message: {
      width: '100%',
      marginTop: theme.spacing.m,
      padding: theme.spacing.m,
      backgroundColor: '#F5F4FF',
      borderRadius: theme.roundness.xs,
    },
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: 999999,
      borderColor: theme.color.lightGrey,
    },
    detailsButtonLabel: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    detailsButtonLabelIcon: {
      marginLeft: theme.spacing.xs,
      color: theme.color.textLightGrey,
    },
    detailsContainer: {
      width: '100%',
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: theme.color.lightGrey,
    },
    detailsPropertyLabel: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    detailsPropertyValue: {
      marginTop: theme.spacing.s,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
    detailsPropertySpacing: {
      marginTop: theme.spacing.l,
    },
    statusContainer: {
      marginTop: 40,
    },
  })
