import React from 'react'
import { Body, Button, Header, Icon, Left, Right, Title } from 'native-base'
import { useNavigation } from '@react-navigation/native'

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

  return (
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
  )
}

export default NavigationHeader
