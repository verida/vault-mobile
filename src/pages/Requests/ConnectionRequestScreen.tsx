import { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
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

export interface ConnectionRequestScreenParams {
  connectionName?: string
  connectionLogo?: string
  requestMessage?: string
  data: AuthorizationRequestMessage // TODO: Make it multiple types
}

type ConnectionRequestScreenProps = MainStackScreenProps<'ConnectionRequest'>

export const ConnectionRequestScreen: React.FunctionComponent<ConnectionRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const {
      connectionName = 'Unidentified',
      data,
      requestMessage,
    } = route.params

    const { handleAcceptConnectionRequest } = usePolygonId()
    const styles = useThemeAwareStyle(createStyles)
    const { bottom } = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleConnect = useCallback(() => {
      handleAcceptConnectionRequest(data)
      handleClose()
    }, [handleAcceptConnectionRequest, data, handleClose])

    return (
      <Screen withKeyboardAvoidingView>
        <NavigationHeader
          title='Connection Request'
          left={{
            icon: 'close',
            action: handleClose,
          }}
        />
        <View style={[styles.constainer, { marginBottom: bottom }]}>
          <View
            style={{
              flexDirection: 'column',
            }}>
            <Text>{`Connect with ${connectionName}`}</Text>
            <Text>{requestMessage}</Text>
          </View>
          <Button onPress={handleConnect}>Connect</Button>
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
