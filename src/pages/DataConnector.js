import { Container } from 'native-base'
import React, { useEffect } from 'react'

import NavigationHeader from 'components/Navigation/NavigationHeader'

export default (props) => {
  useEffect(() => {
    const init = async () => {
      // eslint-disable-next-line no-console
      console.log(props.route.params, 'params')
    }

    init()
  }, [props.route.params, props.navigation])

  return (
    <Container>
      <NavigationHeader title='Data Connector' left={{ icon: 'skip' }} />
    </Container>
  )
}
