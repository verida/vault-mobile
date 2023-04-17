import { CredentialsOfferMessage } from '@0xpolygonid/js-sdk'
import { usePolygonId } from 'features/polygonid'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Text } from 'components/Typography/Text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export interface IncomingDataRequestScreenParams {
  connectionName?: string
  connectionLogo?: string
  requestDate?: Date
  requestMessage?: string
  data: CredentialsOfferMessage // TODO: Make it multiple types, likely to be an array
}

type IncomingDataRequestScreenProps =
  MainStackScreenProps<'IncomingDataRequest'>

export const IncomingDataRequestScreen: React.FunctionComponent<IncomingDataRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const {
      connectionName = 'Unidentified',
      data,
      requestMessage,
    } = route.params

    const [waitingConfirmation, setWaitingConfirmation] = useState(false)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const { handleAcceptCredentialOffer } = usePolygonId()
    const styles = useThemeAwareStyle(createStyles)
    const { bottom } = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleAccept = useCallback(async () => {
      setWaitingConfirmation(true)
      try {
        const result = await handleAcceptCredentialOffer(data)
        setSuccess(result)
      } catch (_error: unknown) {
        setError(true)
      }
      setWaitingConfirmation(false)
    }, [handleAcceptCredentialOffer, data])

    return (
      <Screen withKeyboardAvoidingView>
        <NavigationHeader
          title='Incoming Data'
          left={{
            icon: 'close',
            action: handleClose,
          }}
        />
        <View style={[styles.container, { marginBottom: bottom }]}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {waitingConfirmation ? <ActivityIndicator /> : null}
            {error ? <Text>Something went wrong</Text> : null}
            {success ? <Text>Success</Text> : null}
            {!waitingConfirmation && !error && !success ? (
              <Text>{requestMessage}</Text>
            ) : null}
          </View>
          <View style={styles.footer}>
            {error || success ? (
              <>
                <Button onPress={handleClose} style={styles.actionButton}>
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  onPress={handleClose}
                  color='secondary'
                  disabled={waitingConfirmation}
                  style={[styles.actionButton, styles.mr]}>
                  Decline
                </Button>
                <Button
                  onPress={handleAccept}
                  disabled={waitingConfirmation}
                  style={[styles.actionButton, styles.ml]}>
                  Accept
                </Button>
              </>
            )}
          </View>
        </View>
      </Screen>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.m,
      justifyContent: 'space-between',
    },
    footer: {
      flexDirection: 'row',
    },
    actionButton: {
      flex: 1,
      height: 40,
    },
    mr: {
      marginRight: 10,
    },
    ml: {
      marginLeft: 10,
    },
  })
