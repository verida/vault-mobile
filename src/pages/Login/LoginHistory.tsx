import { Container, Icon } from 'native-base'
import React, { useState } from 'react'
import { SceneMap, TabView } from 'react-native-tab-view'

import HistoryLayout from 'components/Layouts/HistoryLayout'
import LoginTabs from 'components/Navigation/LoginTabs'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'

const tabs = [
  { key: 'approved', title: 'Approved' },
  { key: 'denied', title: 'Denied' },
]

export type LoginHistoryScreenParams = undefined

type LoginHistoryScreenProps = MainStackScreenProps<'LoginHistory'>

export const LoginHistoryScreen: React.FC<LoginHistoryScreenProps> = (
  props
) => {
  const { navigation } = props

  const [index, setIndex] = useState(0)

  const renderScene = SceneMap({
    approved: HistoryLayout,
    denied: HistoryLayout,
  })

  return (
    <Container>
      <NavigationHeader
        title='Login History'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
      />
      <TabView
        renderTabBar={(_props) => (
          <LoginTabs {..._props} onIndexChange={setIndex} />
        )}
        navigationState={{ index, routes: tabs }}
        renderScene={renderScene}
        onIndexChange={setIndex}
      />
    </Container>
  )
}
