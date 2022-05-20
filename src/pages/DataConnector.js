import { Container, Icon } from 'native-base'
import React, { useState } from 'react'
import Text from 'components/Text'

import NavigationHeader from 'components/Navigation/NavigationHeader'

export default (props) => {
  const [linkParams] = useState(JSON.stringify(props.route.params))

  return (
    <Container>
      <NavigationHeader
        title='Data Connector'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
        }}
      />
      <Text>{linkParams}</Text>
    </Container>
  )
}
