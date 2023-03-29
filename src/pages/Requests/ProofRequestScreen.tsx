import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Text } from 'components/Typography/Text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

export interface ProofRequestScreenProps {
  connectionName?: string
  connectionLogo?: string
  requestDate?: Date
  requestMessage?: string
  data: any
  onClose?: () => void
  onDecline: () => void
  onAccept: () => void
}

export const ProofRequestScreen: React.FunctionComponent<ProofRequestScreenProps> =
  (props) => {
    const {
      onClose,
      onDecline,
      onAccept,
      connectionName = 'Unidentified',
      requestMessage,
      data,
    } = props

    const styles = useThemeAwareStyle(createStyles)
    const { bottom } = useSafeAreaInsets()

    return (
      <Screen withKeyboardAvoidingView>
        <NavigationHeader
          title='Proof Request'
          left={{
            icon: 'close',
            action: onClose,
          }}
        />
        <View style={[styles.constainer, { marginBottom: bottom }]}>
          <View style={{ flexDirection: 'column' }}>
            <Text>{connectionName}</Text>
            <Text>{requestMessage}</Text>
            <View>{data}</View>
          </View>
          <Button onPress={onAccept}>Connect</Button>
          <Button onPress={onDecline} color='secondary'>
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
