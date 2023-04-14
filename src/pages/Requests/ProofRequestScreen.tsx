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

export interface ProofRequestScreenParams {
  connectionName?: string
  connectionLogo?: string
  requestDate?: Date
  requestMessage?: string
  data: AuthorizationRequestMessage // TODO: Make it multiple types
}

type ProofRequestScreenProps = MainStackScreenProps<'ProofRequest'>

export const ProofRequestScreen: React.FunctionComponent<ProofRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const {
      connectionName = 'Unidentified',
      requestMessage,
      data,
    } = route.params

    const { handleAcceptProofRequest } = usePolygonId()
    const styles = useThemeAwareStyle(createStyles)
    const { bottom } = useSafeAreaInsets()

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleSendProof = useCallback(() => {
      handleAcceptProofRequest(data)
      handleClose()
    }, [handleAcceptProofRequest, data, handleClose])

    return (
      <Screen withKeyboardAvoidingView>
        <NavigationHeader
          title='Proof Request'
          left={{
            icon: 'close',
            action: handleClose,
          }}
        />
        <View style={[styles.constainer, { marginBottom: bottom }]}>
          <View style={{ flexDirection: 'column' }}>
            <Text>{connectionName}</Text>
            <Text>{requestMessage}</Text>
          </View>
          <Button onPress={handleSendProof}>Send Proof</Button>
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
