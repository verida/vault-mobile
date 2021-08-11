import React from 'react'
import { View } from 'react-native'

import AccountInit, { AccountInitMode } from 'components/AccountInit'
import NavigationHeader from 'components/Navigation/NavigationHeader'

function Create() {
  return (
    <View>
      <NavigationHeader title='Create An Account' />
      <AccountInit mode={AccountInitMode.SEED_PHRASE} />
    </View>
  )
}

export default Create
