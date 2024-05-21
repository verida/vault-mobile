import React, { useState } from 'react'
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
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import { ConnectionRequestScreenParams } from './ConnectionRequestScreen'

export const ConnectionRequestScreenContent = React.memo(
  function ConnectionRequestScreenContent({
    params,
    processing,
    error,
    errorMessage,
    success,
    processButtonDisabled,
    detailProperties,
    handleConnect,
    handleReject,
    handleAlertProcess,
  }: {
    params: ConnectionRequestScreenParams
    processing: boolean
    error: boolean
    errorMessage: string | undefined
    success: boolean
    processButtonDisabled: boolean
    detailProperties: RequestDetailProperty[]
    handleConnect: () => Promise<void>
    handleReject: () => Promise<void> | void
    handleAlertProcess: () => void
  }): JSX.Element {
    const { name, logo, details } = params
    const styles = useThemeAwareStyle(createStyles)
    const [erroMessage] = useState<string | undefined>()
    const [detailsOpen, setDetailsOpen] = useState(false)
    const insets = useSafeAreaInsets()

    const handleToggleDetails = () => {
      setDetailsOpen((prevValue) => !prevValue)
    }

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
                <Avatar
                  source={logo}
                  fallbackType='person'
                  style={styles.logo}
                />
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
            alertContent={errorMessage}
            alertOnPress={handleAlertProcess}
            actions={
              processing || error || success
                ? [
                    {
                      label: 'Close',
                      onPress: handleReject,
                      disabled: processing,
                    },
                  ]
                : [
                    {
                      label: 'Decline',
                      onPress: handleReject,
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
)

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
      width: '100%',
    },
    statusContainer: {
      marginTop: theme.spacing.xxl,
    },
  })
