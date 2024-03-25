import type { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from 'react-native-vector-icons/Feather'

import {
  Avatar,
  BottomActionBar,
  RequestDetailProperty,
  RequestDetails,
  RequestMessage,
  StatusInfo,
  Typography,
} from '~/components'
import { usePolygonId } from '~/features/polygonid'
import type { Protocol } from '~/features/protocols'
import { reduceProtocols } from '~/features/protocols'
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

  const protocols = reduceProtocols(details.protocols, 16)

  const detailProperties: RequestDetailProperty[] = useMemo(() => {
    const properties = []

    properties.push({
      label: 'Requested on',
      value: (details.timestamp
        ? new Date(details.timestamp)
        : new Date()
      ).toLocaleString(),
    })

    properties.push({
      label: 'From',
      value: details.requesterId,
    })

    properties.push({
      label: 'Via',
      value: <>{protocols}</>,
    })

    return properties
  }, [details.requesterId, details.timestamp, protocols])

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
              <Avatar source={logo} fallbackType='person' style={styles.logo} />
              {details.url ? (
                <Typography variant='bodySemiBold' style={styles.url}>
                  {details.url}
                </Typography>
              ) : null}
              <Typography
                variant='h2'
                style={
                  styles.connectMessage
                }>{`Connect to ${name}`}</Typography>
              {details.message ? (
                <RequestMessage style={styles.messageContainer}>
                  {details.message}
                </RequestMessage>
              ) : null}

              <TouchableOpacity
                onPress={handleToggleDetails}
                style={styles.detailsButton}>
                <Typography
                  variant='bodySemiBold'
                  style={styles.detailsButtonLabel}>
                  Request details
                </Typography>
                <Feather
                  name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  style={styles.detailsButtonLabelIcon}
                />
              </TouchableOpacity>
              {detailsOpen ? (
                <RequestDetails
                  properties={detailProperties}
                  style={styles.detailsContainer}
                />
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
                    disabled: processing,
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
      paddingTop: theme.spacing.xxxxl,
      paddingBottom: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      alignItems: 'center',
    },
    logo: {
      height: 72,
      aspectRatio: 1 / 1,
      borderRadius: theme.roundness.full,
    },
    url: {
      marginTop: theme.spacing.s,
      color: theme.color.textLightGrey,
    },
    connectMessage: {
      marginTop: theme.spacing.sm,
    },
    messageContainer: {
      marginTop: theme.spacing.m,
      width: '100%',
    },
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: theme.roundness.full,
      borderColor: theme.color.lightGrey,
    },
    detailsButtonLabel: {
      color: theme.color.textLightGrey,
    },
    detailsButtonLabelIcon: {
      marginLeft: theme.spacing.xs,
      color: theme.color.textLightGrey,
    },
    detailsContainer: {
      marginTop: theme.spacing.sm,
    },
    statusContainer: {
      marginTop: theme.spacing.xxl,
    },
  })
