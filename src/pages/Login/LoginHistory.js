import { Container } from 'native-base'
import React, { useState } from 'react'
import { SceneMap, TabView } from 'react-native-tab-view'

import NavigationHeader from 'components/Navigation/NavigationHeader'

import LeftArrowIcon from '../../assets/left_arrow_icon.svg'
import HistoryLayout from '../../components/Layouts/HistoryLayout'
import LoginTabs from '../../components/Navigation/LoginTabs'

export default (props) => {
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'approved', title: 'Approved' },
    { key: 'denied', title: 'Denied' },
  ])

  const renderScene = SceneMap({
    approved: HistoryLayout,
    denied: HistoryLayout,
  })

  return (
    <Container>
      <NavigationHeader
        title='Login History'
        left={{
          icon: <LeftArrowIcon />,
          action: () => props.navigation.goBack(),
        }}
      />
      <TabView
        renderTabBar={(_props) => (
          <LoginTabs {..._props} onIndexChange={setIndex} />
        )}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
      />
    </Container>
  )
}
