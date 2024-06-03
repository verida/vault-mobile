import type { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
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
import {
  getUserFriendlyAllowedIssuers,
  getUserFriendlyProofRequestRequirements,
  usePolygonId,
} from '~/features/polygonid'
import type { Protocol } from '~/features/protocols'
import { reduceProtocols } from '~/features/protocols'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export interface ProofRequestScreenParams {
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
}

type ProofRequestScreenProps = MainStackScreenProps<'ProofRequest'>

/** Screen representing a request for a Zero Knowledge Proof */
export const ProofRequestScreen: React.FunctionComponent<
  ProofRequestScreenProps
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

  const handleSendProof = useCallback(async () => {
    if (!polygonIdManager) {
      return
    }

    setProcessing(true)
    // TODO: Handle different actions depending on the type of request

    // Doesn't need a try/catch as handled in the function itself
    const { result, error: requestError } =
      await polygonIdManager.processProofRequest(data)
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
      title: 'Proof Request',
    })
  }, [navigation, handleClose])

  const protocols = reduceProtocols(details.protocols, 16)

  const detailProperties: RequestDetailProperty[] = useMemo(() => {
    const properties: { label: string; value: ReactNode }[] = []

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
            <View style={styles.proofContainer}>
              <Typography variant='h5SemiBold' style={styles.proofMessage}>
                The following proof is requested
              </Typography>
              {data.body?.scope?.map((item) => (
                <View style={styles.proofItemContainer} key={item.id}>
                  <Typography variant='h4'>
                    {item.query.type || 'Credential'}
                  </Typography>
                  <View style={styles.proofItemPropertySpacing}>
                    <Typography
                      variant='bodySemiBold'
                      style={styles.proofItemPropertyLabel}>
                      Requirements
                    </Typography>
                    <Typography
                      variant='bodySemiBold'
                      style={styles.proofItemPropertyValue}>
                      {getUserFriendlyProofRequestRequirements(item.query).map(
                        (requirement) => (
                          <Typography key={requirement}>
                            {requirement}
                          </Typography>
                        )
                      )}
                    </Typography>
                  </View>
                  <View style={styles.proofItemPropertySpacing}>
                    <Typography
                      variant='bodySemiBold'
                      style={styles.proofItemPropertyLabel}>
                      Allowed issuers
                    </Typography>
                    <Typography
                      variant='bodySemiBold'
                      style={styles.proofItemPropertyValue}>
                      {getUserFriendlyAllowedIssuers(
                        item.query.allowedIssuers as string[]
                      ).map((issuer) => (
                        <Typography key={issuer}>{issuer}</Typography>
                      ))}
                    </Typography>
                  </View>
                </View>
              ))}
              {/* TODO: Handle if there is no proof */}
            </View>
            <View style={styles.infoMessageContainer}>
              <Typography style={styles.infoMessage}>
                {/* TODO: Check whether the selective disclosure feature disclose value in clear. If so, identify if the request has selective disclosure and adapt the messages for the user */}
                No private data will be sent. A zero knowledge proof will be
                generated by {protocols}
              </Typography>
            </View>
          </>
        ) : (
          <StatusInfo
            style={styles.statusContainer}
            statusType={
              processing ? 'processsing' : success ? 'success' : 'error'
            }
            title={
              processing
                ? 'Generating proof...'
                : success
                  ? 'Success!'
                  : 'Error!'
            }
            subtitle={
              // TODO: Find better messages
              processing
                ? 'Please wait a moment, we are generating a zero knowledge proof to share. No private data will be sent.'
                : success
                  ? `Your proof has been generated and sent successfully.`
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
                  label: 'Send Proof',
                  onPress: handleSendProof,
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
    detailsContainer: {
      marginTop: theme.spacing.m,
    },
    messageContainer: {
      marginTop: theme.spacing.l,
    },
    proofContainer: {
      marginTop: theme.spacing.xl,
    },
    proofMessage: {
      color: theme.color.textLightGrey,
    },
    proofItemContainer: {
      marginTop: theme.spacing.m,
      padding: theme.spacing.m,
      backgroundColor: theme.color.snow,
      borderRadius: theme.roundness.xs,
    },
    proofItemPropertyLabel: {
      color: theme.color.textLightGrey,
    },
    proofItemPropertyValue: {
      marginTop: theme.spacing.s,
    },
    proofItemPropertySpacing: {
      marginTop: theme.spacing.l,
    },
    infoMessageContainer: {
      marginTop: theme.spacing.m,
    },
    infoMessage: {
      color: theme.color.textLightGrey,
    },
    statusContainer: {
      marginTop: 104,
    },
  })
