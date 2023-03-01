import { useNetInfo } from '@react-native-community/netinfo'
import { useNavigation } from '@react-navigation/native'
import { Body, Button, Header, Icon, Left, Right, Title } from 'native-base'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import Text from 'components/Text'
import { DECLINE_COLOR, SEPARATOR_EXTRA_LIGHT } from 'constants/color'

import LeftArrowIcon from '../../assets/left_arrow_icon.svg'
import { NUNITO_SANS_BOLD } from '../../constants/text'

export type HeaderSideButton = {
  icon: string | React.ReactElement
  action?: () => void
}

export type HeaderProps = {
  left?: HeaderSideButton
  right?: HeaderSideButton
  title?: string | React.ReactNode
  titleIcon?: React.ReactElement
  avatarIcon?: React.ReactNode
  rightComponent?: React.ReactNode
  bottomBorder?: boolean
}

function NavigationHeader({
  left = { icon: 'back' },
  title,
  right,
  titleIcon,
  avatarIcon,
  rightComponent,
  bottomBorder = true,
}: HeaderProps) {
  const navigation = useNavigation()
  const netInfo = useNetInfo()

  return (
    <>
      <Header
        transparent
        style={
          bottomBorder
            ? Platform.select({
                ios: {
                  borderBottomWidth: 1,
                  borderBottomColor: SEPARATOR_EXTRA_LIGHT,
                },
                android: { elevation: 1 },
              })
            : {}
        }>
        <Left style={{ flex: 0.2, marginLeft: 6 }}>
          {(function () {
            switch (left.icon) {
              case 'back':
                return navigation.canGoBack() ? (
                  <Button transparent onPress={navigation.goBack}>
                    <LeftArrowIcon />
                  </Button>
                ) : null
              case 'close':
                return navigation.canGoBack() ? (
                  <Button transparent onPress={navigation.goBack}>
                    <Icon name='close' style={{ color: '#000' }} />
                  </Button>
                ) : null
              case 'close':
                return navigation.canGoBack() ? (
                  <Button transparent onPress={navigation.goBack}>
                    <Icon name='close' style={{ color: '#000' }} />
                  </Button>
                ) : null
              case 'skip':
                return null
              case 'avatar':
                return <View>{avatarIcon}</View>
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
          {title ? <Title style={styles.textTitle}>{title}</Title> : null}
          {titleIcon && titleIcon}
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
  textTitle: {
    color: '#000',
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '600',
    fontSize: 17,
  },
})

export default NavigationHeader
