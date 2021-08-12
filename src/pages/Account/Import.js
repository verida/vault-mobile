import React from 'react'
import { View } from 'react-native'

import AccountInit, { AccountInitMode } from 'components/AccountInit'
import NavigationHeader from 'components/Navigation/NavigationHeader'

export default () => (
  <View>
    <NavigationHeader title='Import An Account' />
    <AccountInit mode={AccountInitMode.SELECT_NETWORK} />
  </View>
)
