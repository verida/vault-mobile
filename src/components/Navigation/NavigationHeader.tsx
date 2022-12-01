import { useNetInfo } from '@react-native-community/netinfo'
import { useNavigation } from '@react-navigation/native'
import { Body, Button, Header, Left, Right, Title } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import LeftArrowIcon from 'assets/icons/left_arrow_icon.svg'
import Text from 'components/Text'
import { DECLINE_COLOR, TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export type HeaderSideButton = {
  icon: string | React.ReactElement
  action?: () => void
}

export type HeaderProps = {
  left?: HeaderSideButton
  right?: HeaderSideButton
  title: string
  rightComponent?: React.ReactNode
}

function NavigationHeader({
  left = { icon: 'back' },
  title,
  right,
  rightComponent,
}: HeaderProps) {
  const navigation = useNavigation()
  const netInfo = useNetInfo()

  return (
    <View>
      <Header
        transparent
        style={{ elevation: 1 }}
        androidStatusBarColor='light-gray'>
        <Left style={{ flex: 0.2, marginLeft: 6 }}>
          {(function () {
            switch (left.icon) {
              case 'back':
                return !navigation.canGoBack() ? (
                  <Button transparent onPress={navigation.goBack}>
                    <LeftArrowIcon />
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
          {title ? <Title style={styles.title}>{title}</Title> : null}
        </Body>
        <Right style={{ flex: 0.2 }}>
          {rightComponent ? (
            rightComponent
          ) : right ? (
            <Button transparent onPress={right.action}>
              {right.icon}
            </Button>
          ) : null}
        </Right>
      </Header>
      {netInfo.isConnected === false && (
        <View style={styles.netInfoBar}>
          <Text style={styles.netInfoText}>No network connection</Text>
        </View>
      )}
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#ddd',
        }}
      />
    </View>
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
  title: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'justify',
    color: TEXT_COLOR,
  },
})

export default NavigationHeader
