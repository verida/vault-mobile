import React from 'react'
import { StyleSheet } from 'react-native'
import { Container, Icon } from 'native-base'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'

import SettingsSvg from 'assets/icons/settings.svg'

export default ({ navigation }) => {
  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title='Buy ETH'
        right={{
          icon: <Text>05:19</Text>,
        }}
      />
    </Container>
  )
}

const styles = StyleSheet.create({})
