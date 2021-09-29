import React from 'react'
import { Body, Button, Header, Icon, Left, Right, Title } from 'native-base'
import { useNavigation } from '@react-navigation/native'
import { useNetInfo } from '@react-native-community/netinfo'
import { StyleSheet, View } from 'react-native'
import Text from 'components/Text'
import { DECLINE_COLOR } from 'constants/color'

export type HeaderSideButton = {
  icon: string
  action?: () => void
}

export type HeaderProps = {
  left?: HeaderSideButton
  right?: HeaderSideButton
  title: string
}

function NavigationHeader({
  left = { icon: 'back' },
  title,
  right,
}: HeaderProps) {
  const navigation = useNavigation()
  const netInfo = useNetInfo()

  return (
    <>
      <Header
        transparent
        style={{ elevation: 1 }}
        androidStatusBarColor='light-gray'>
        <Left style={{ flex: 0.2, marginLeft: 6 }}>
          {(function () {
            switch (left.icon) {
              case 'back':
                return navigation.canGoBack() ? (
                  <Button transparent onPress={navigation.goBack}>
                    <Icon name='arrow-back' style={{ color: '#000' }} />
                  </Button>
                ) : null
              case 'skip':
                return null
              default:
                return (
                  <Button transparent onPress={left.action}>
                    {left.icon}
                  </Button>
                )
            }
          })()}
        </Left>
        <Body style={{ flex: 1, alignItems: 'center' }}>
          {title ? <Title style={{ color: '#000' }}>{title}</Title> : null}
        </Body>
        <Right style={{ flex: 0.2 }}>
          {right ? (
            <Button transparent onPress={right.action}>
              {right.icon}
            </Button>
          ) : null}
        </Right>
      </Header>
      {!netInfo.isConnected && (
        <View style={styles.netInfoBar}>
          <Text style={styles.netInfoText}>No network connection</Text>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  netInfoBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    backgroundColor: DECLINE_COLOR,
  },
  netInfoText: {
    color: 'white',
    fontSize: 15,
  },
})

export default NavigationHeader
