import { Container, Icon } from 'native-base'
import React, { useEffect } from 'react'
import { Alert } from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'

export default (props) => {
  useEffect(() => {
    const init = async () => {
      // eslint-disable-next-line no-console
      console.log(props.route.params, 'params')
      Alert.alert(JSON.stringify(props.route.params))
    }

    init()
  }, [props.route.params, props.navigation])

  return (
    <Container>
      <NavigationHeader
        title='Data Connector'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
        }}
      />
    </Container>
  )
}
