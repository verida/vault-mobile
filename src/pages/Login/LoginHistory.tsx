import React, { useEffect, useState } from 'react'
import { SceneMap, TabView } from 'react-native-tab-view'

import { ScreenWrapper } from '~/components'
import HistoryLayout from '~/components/Layouts/HistoryLayout'
import LoginTabs from '~/components/Navigation/LoginTabs'
import { MainStackScreenProps } from '~/navigation/types'

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

  useEffect(() => {
    navigation.setOptions({
      title: 'Login History',
    })
  }, [navigation])

  const [index, setIndex] = useState<number>(0)

  const renderScene = SceneMap({
    approved: HistoryLayout,
    denied: HistoryLayout,
  })

  return (
    <ScreenWrapper>
      <TabView
        renderTabBar={(_props) => (
          <LoginTabs {..._props} onIndexChange={setIndex} />
        )}
        navigationState={{ index, routes: tabs }}
        renderScene={renderScene}
        onIndexChange={setIndex}
      />
    </ScreenWrapper>
  )
}
