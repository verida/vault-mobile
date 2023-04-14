import { CredentialsOfferMessage } from '@0xpolygonid/js-sdk'
import { usePolygonId } from 'features/polygonid'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
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

    const { handleAcceptCredentialOffer } = usePolygonId()
    const styles = useThemeAwareStyle(createStyles)
    const { bottom } = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleAccept = useCallback(() => {
      handleAcceptCredentialOffer(data)
      handleClose()
    }, [handleAcceptCredentialOffer, data, handleClose])

    return (
      <Screen withKeyboardAvoidingView>
        <NavigationHeader
          title='Incoming Data'
          left={{
            icon: 'close',
            action: handleClose,
          }}
        />
        <View style={[styles.constainer, { marginBottom: bottom }]}>
          <View style={{ flexDirection: 'column' }}>
            <Text>{connectionName}</Text>
            <Text>{requestMessage}</Text>
            <Text>Incoming Data Items</Text>
            {/* <View>{data}</View> */}
          </View>
          <Button onPress={handleAccept}>Accept</Button>
          <Button onPress={handleClose} color='secondary'>
            Decline
          </Button>
        </View>
      </Screen>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    constainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.m,
      justifyContent: 'space-between',
    },
  })
