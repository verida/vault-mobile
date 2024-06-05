import type { CredentialsOfferMessage } from '@0xpolygonid/js-sdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  BottomActionBar,
  RequestDetailProperty,
  RequestDetails,
  RequestHeader,
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

// TODO: Make sure the params are generic enough to be used for other types of requests (Verida Connect, WalletConnect, Polygon ID, etc.)
export interface IncomingDataRequestScreenParams {
  name: string // TODO: Make it optional and provide a consistent way to representing an unknown requester
  logo?: string
  details: {
    timestamp?: string
    requesterId: string
    message?: string
    url?: string
    protocols: Protocol[]
  }
  data: CredentialsOfferMessage
  // TODO: Make it multiple types for the different protocols
}

type IncomingDataRequestScreenProps =
  MainStackScreenProps<'IncomingDataRequest'>

export const IncomingDataRequestScreen: React.FunctionComponent<
  IncomingDataRequestScreenProps
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

  const handleAccept = useCallback(async () => {
    if (!polygonIdManager) {
      return
    }

    setProcessing(true)
    // TODO: Handle different actions depending on the type of request

    // Doesn't need a try/catch as handled in the function itself
    const { result, error: requestError } =
      await polygonIdManager.processCredentialsOffer(data)
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
      title: 'Incoming Data',
    })
  }, [navigation, handleClose])

  const protocols = reduceProtocols(details.protocols, 16)

  const detailProperties: RequestDetailProperty[] = useMemo(() => {
    const properties = []

    properties.push({
      label: 'From',
      value: details.requesterId,
    })

    if (details.url) {
      properties.push({
        label: 'URL',
        value: details.url,
      })
    }

    properties.push({
      label: 'Via',
      value: <>{protocols}</>,
    })

    return properties
  }, [details.requesterId, details.url, protocols])

  return (
    <View
      // TODO: Use <ScreenWrapper>
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
            <RequestHeader
              senderName={name}
              avatar={logo}
              timestamp={details.timestamp}
              isDetailsOpen={detailsOpen}
              onToggleDetails={handleToggleDetails}
            />
            {detailsOpen ? (
              <RequestDetails
                properties={detailProperties}
                style={styles.detailsContainer}
              />
            ) : null}
            {details.message ? (
              <RequestMessage style={styles.messageContainer}>
                {details.message}
              </RequestMessage>
            ) : null}
            <View style={styles.dataContainer}>
              <Typography variant='h5SemiBold' style={styles.dataLabel}>
                Incoming data item
              </Typography>
              {data.body?.credentials?.map((item) => (
                <View style={styles.dataItemContainer} key={item.id}>
                  <Typography variant='h4'>Credential</Typography>
                  <Typography
                    variant='bodySemiBold'
                    style={styles.dataItemLabel}>
                    {item.description}
                  </Typography>
                </View>
              ))}
              {/* TODO: Handle if there is no data items */}
            </View>
          </>
        ) : (
          // TODO: Implement the design from Figma (success display the request with an 'Accepted' banner and display the data item)
          <StatusInfo
            style={styles.statusContainer}
            statusType={
              processing ? 'processsing' : success ? 'success' : 'error'
            }
            title={
              processing ? 'Saving data...' : success ? 'Success!' : 'Error!'
            }
            subtitle={
              processing
                ? 'Please wait a few seconds, we are verifying and saving the data.'
                : success
                  ? `The data from ${name} have been successfully saved.` // TODO: Find better messages
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
                  variant: 'secondary',
                },
                {
                  label: 'Accept',
                  onPress: handleAccept,
                  disabled: processButtonDisabled,
                },
              ]
        }
      />
    </View>
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
      padding: theme.spacing.m,
    },
    header: {
      flexDirection: 'row',
      marginTop: theme.spacing.s,
    },
    detailsContainer: {
      marginTop: theme.spacing.m,
    },
    messageContainer: {
      marginTop: theme.spacing.l,
    },
    dataContainer: {
      marginTop: theme.spacing.xl,
    },
    dataLabel: {
      color: theme.color.textLightGrey,
    },
    dataItemContainer: {
      marginTop: theme.spacing.m,
      padding: theme.spacing.m,
      backgroundColor: theme.color.snow,
      borderRadius: theme.roundness.xs,
    },
    dataItemLabel: {
      marginTop: theme.spacing.s,
      color: theme.color.black700,
    },
    statusContainer: {
      marginTop: 104,
    },
  })
