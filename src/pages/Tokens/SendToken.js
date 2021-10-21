import React from 'react'
import { StyleSheet } from 'react-native'
import { Container, Icon } from 'native-base'

import NavigationHeader from 'components/Navigation/NavigationHeader'

export default ({ navigation }) => {
  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title='Send ETH'
      />
    </Container>
  )
}

const styles = StyleSheet.create({})
