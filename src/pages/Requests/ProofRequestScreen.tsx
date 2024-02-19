import type { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import { Alert, StatusInfo } from 'components'
import {
  getUserFriendlyAllowedIssuers,
  getUserFriendlyProofRequestRequirements,
  usePolygonId,
} from 'features/polygonid_new'
import type { Protocol } from 'features/protocols'
import { getProtocolLabel, getProtocolLogo } from 'features/protocols'
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

import AppLogo from 'components/AppLogo'
import Button from 'components/Button'
import { Text } from 'components/Typography/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

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
export const ProofRequestScreen: React.FunctionComponent<ProofRequestScreenProps> =
  (props) => {
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

    const handleSendProof = useCallback(async () => {
      if (!polygonIdManager) {
        return
      }

      setProcessing(true)
      // TODO: Handle different actions depending on the type of request

      // Doesn't need a try/catch as handled in the function itself
      const { result, error: requestError } =
        await polygonIdManager.acceptProofRequest(data)
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

    const detailsView = (
      <View style={styles.detailsContainer}>
        <View>
          <Text style={styles.detailsPropertyLabel}>{`From`}</Text>
          <Text style={styles.detailsPropertyValue}>
            {details.requesterId || ' '}
          </Text>
        </View>
        {details.url ? (
          <View style={styles.detailsPropertySpacing}>
            <Text style={styles.detailsPropertyLabel}>{`URL`}</Text>
            <Text style={styles.detailsPropertyValue}>{details.url}</Text>
          </View>
        ) : null}
        <View style={styles.detailsPropertySpacing}>
          <Text style={styles.detailsPropertyLabel}>{`Via`}</Text>
          <Text style={styles.detailsPropertyValue}>{protocols}</Text>
        </View>
      </View>
    )

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
                <View style={styles.header}>
                  <AppLogo // TODO: Define the best logo placeholder
                    url={logo || null}
                    style={styles.logo}
                  />
                  <View>
                    <Text style={styles.name}>{name}</Text>
                    <TouchableOpacity
                      onPress={handleToggleDetails}
                      style={styles.detailsButton}>
                      <Text style={styles.detailsButtonLabel}>
                        {(details.timestamp
                          ? new Date(details.timestamp)
                          : new Date()
                        ).toLocaleString()}
                      </Text>
                      <Feather
                        name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        style={styles.detailsButtonLabelIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {detailsOpen ? detailsView : null}
                {details.message ? (
                  <View style={styles.message}>
                    <Text>{`"${details.message}"`}</Text>
                  </View>
                ) : null}
                <View style={styles.proofContainer}>
                  <Text style={styles.proofMessage}>
                    The following proof is requested
                  </Text>
                  {data.body?.scope?.map((item) => (
                    <View style={styles.proofItemContainer} key={item.id}>
                      <Text style={styles.proofItemTypeLabel}>
                        {item.query.type || 'Credential'}
                      </Text>
                      <View style={styles.proofItemPropertySpacing}>
                        <Text style={styles.proofItemPropertyLabel}>
                          Requirements
                        </Text>
                        <Text style={styles.proofItemPropertyValue}>
                          {getUserFriendlyProofRequestRequirements(
                            item.query
                          ).map((requirement) => (
                            <Text key={requirement}>{requirement}</Text>
                          ))}
                        </Text>
                      </View>
                      <View style={styles.proofItemPropertySpacing}>
                        <Text style={styles.proofItemPropertyLabel}>
                          Allowed issuers
                        </Text>
                        <Text style={styles.proofItemPropertyValue}>
                          {getUserFriendlyAllowedIssuers(
                            item.query.allowedIssuers as string[]
                          ).map((issuer) => (
                            <Text key={issuer}>{issuer}</Text>
                          ))}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {/* TODO: Handle if there is no proof */}
                </View>
                <View style={styles.infoMessageContainer}>
                  <Text style={styles.infoMessage}>
                    {/* TODO: Check whether the selective disclosure feature disclose value in clear. If so, identify if the request has selective disclosure and adapt the messages for the user */}
                    No private data will be sent. A zero knowledge proof will be
                    generated by {protocols}
                  </Text>
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

          <View style={styles.footer}>
            {polygonIdNotReady ? (
              <Alert type='warning' style={styles.footerAlert}>
                <Text style={styles.footerAlertContent}>
                  The Polygon ID engine is not ready yet. Please wait a moment
                </Text>
              </Alert>
            ) : null}
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
                    onPress={handleSendProof}
                    disabled={processButtonDisabled}
                    style={[styles.actionButton, styles.ml]}>
                    Send Proof
                  </Button>
                </>
              )}
            </View>
          </View>
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
      padding: theme.spacing.m,
    },
    header: {
      flexDirection: 'row',
      marginTop: theme.spacing.s,
    },
    logo: {
      width: 48,
      aspectRatio: 1 / 1,
      borderRadius: 999999,
      marginRight: theme.spacing.s,
    },
    name: {
      fontSize: 17,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_BOLD,
    },
    detailsButton: {
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailsButtonLabel: {
      fontSize: 12,
      lineHeight: 18,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    detailsButtonLabelIcon: {
      marginLeft: theme.spacing.xs,
      color: theme.color.textLightGrey,
    },
    detailsContainer: {
      marginTop: theme.spacing.m,
      width: '100%',
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
    message: {
      marginTop: theme.spacing.l,
      padding: theme.spacing.m,
      backgroundColor: '#F5F4FF',
      borderRadius: theme.roundness.xs,
    },
    proofContainer: {
      marginTop: theme.spacing.xl,
    },
    proofMessage: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    proofItemContainer: {
      marginTop: theme.spacing.m,
      padding: theme.spacing.m,
      backgroundColor: theme.color.snow,
      borderRadius: theme.roundness.xs,
    },
    proofItemTypeLabel: {
      fontSize: 17,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_BOLD,
    },
    proofItemLabel: {
      marginTop: theme.spacing.s,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_BOLD,
      color: theme.color.black700,
    },
    proofItemPropertyLabel: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    proofItemPropertyValue: {
      marginTop: theme.spacing.s,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
    proofItemPropertySpacing: {
      marginTop: theme.spacing.l,
    },
    infoMessageContainer: {
      marginTop: theme.spacing.m,
    },
    infoMessage: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.color.textLightGrey,
    },
    statusContainer: {
      marginTop: 104,
    },
    footer: {
      backgroundColor: theme.color.background,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
    },
    footerAlert: {
      marginBottom: theme.spacing.sm,
    },
    footerAlertContent: {
      flexDirection: 'row',
    },
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
