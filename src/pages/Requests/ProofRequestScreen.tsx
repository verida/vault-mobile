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

export interface ProofRequestScreenParams {
  name?: string
  logo?: string
  details: {
    timestamp?: Date // TODO: Consider a string timestamp if issue with non-seriazable data in navigation params
    requesterId?: string
    message?: string
    url?: string
  }
  data: AuthorizationRequestMessage // TODO: Make it multiple types
}

type ProofRequestScreenProps = MainStackScreenProps<'ProofRequest'>

export const ProofRequestScreen: React.FunctionComponent<ProofRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const {
      name = 'Unknown', // TODO: Define the best placeholder
      logo,
      details,
      data,
    } = route.params

    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const { handleAcceptProofRequest } = usePolygonId()
    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleSendProof = useCallback(async () => {
      setProcessing(true)
      try {
        // TODO: Handle different actions depending on the type of request
        const successfulResult = await handleAcceptProofRequest(data)
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
    }, [handleAcceptProofRequest, data])

    const handleToggleDetails = useCallback(() => {
      setDetailsOpen((prevValue) => !prevValue)
    }, [])

    useEffect(() => {
      navigation.setOptions({
        title: 'Proof Request',
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

    const detailsView = (
      <View style={styles.detailsContainer}>
        <View>
          <Text style={styles.detailsPropertyLabel}>{`From`}</Text>
          <Text style={styles.detailsPropertyValue}>
            {details.requesterId || ' '}
          </Text>
        </View>
        <View style={styles.detailsPropertySpacing}>
          <Text style={styles.detailsPropertyLabel}>{`URL`}</Text>
          <Text style={styles.detailsPropertyValue}>{details.url || ' '}</Text>
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
          <View style={styles.container}>
            {/* TODO: Make it a scroll view */}
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
                          ? details.timestamp
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
                    <Text>{details.message}</Text>
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
                          {/* TODO: Build a user-friendly way to display this information */}
                          {/* {JSON.stringify(item.query.credentialSubject)} */}
                          Birthday is prior to 2000-01-01
                        </Text>
                      </View>
                      <View style={styles.proofItemPropertySpacing}>
                        <Text style={styles.proofItemPropertyLabel}>
                          Allowed issuers
                        </Text>
                        <Text style={styles.proofItemPropertyValue}>
                          {/* TODO: Handle if there is no issuers */}
                          {item.query.allowedIssuers &&
                            (item.query.allowedIssuers as string[])
                              .map((issuer) =>
                                issuer === '*' ? 'Any' : issuer
                              )
                              .map((issuer) => (
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
                    A cryptographic proof will be generated.
                  </Text>
                  <Text style={styles.infoMessage}>
                    No private data will be sent.
                  </Text>
                </View>
              </>
            ) : (
              <Status
                style={styles.statusContainer}
                statusType={
                  processing ? 'processsing' : success ? 'success' : 'error'
                }
                title={
                  processing
                    ? 'Generating proof'
                    : success
                    ? 'Success!'
                    : 'Error!'
                }
                subtitle={
                  // TODO: Find better messages
                  processing
                    ? 'Please wait a few seconds.'
                    : success
                    ? `Your proof has been generated and sent successfully.`
                    : 'Something went wrong. Try again later.'
                }
              />
            )}
          </View>

          <View style={styles.footer}>
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
                  disabled={processing}
                  style={[styles.actionButton, styles.ml]}>
                  Send Proof
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
      backgroundColor: theme.color.background,
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
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
