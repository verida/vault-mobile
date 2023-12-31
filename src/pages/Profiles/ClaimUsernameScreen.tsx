import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import {
  ClaimUsernameView,
  ClaimUsernameViewRefProps,
  InputUsernameView,
  InputUsernameViewRefProps,
} from 'components/PublicProfile'
import Screen from 'components/Screen'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'

enum PageType {
  InputUsername,
  ClaimUsername,
}

export type ClaimUsernameScreenParams = undefined

type ClaimUsernameScreenProps = MainStackScreenProps<'ClaimUsername'>

export const ClaimUsernameScreen: React.FC<ClaimUsernameScreenProps> = (
  _props
) => {
  const styles = useThemeAwareStyle(createStyles)
  const [currentPage] = useState(PageType.InputUsername)
  const pagerRef = useRef<PagerView>(null)
  const inputUsernameViewRef = useRef<InputUsernameViewRefProps>(null)
  const claimUsernameViewRef = useRef<ClaimUsernameViewRefProps>(null)

  useEffect(() => {
    inputUsernameViewRef.current?.focusInput()
  }, [])

  return (
    <Screen
      navBar={<NavigationHeader title={'Username'} left={{ icon: 'close' }} />}>
      <PagerView
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        ref={pagerRef}>
        {/* InputUsername */}
        <InputUsernameView
          ref={inputUsernameViewRef}
          onClaimUsername={(newUsername) => {
            pagerRef.current?.setPage(PageType.ClaimUsername)
            claimUsernameViewRef.current?.claimUsername(newUsername)
          }}
        />

        {/* ClaimUsername */}
        <ClaimUsernameView ref={claimUsernameViewRef} />
      </PagerView>
    </Screen>
  )
}

const createStyles = () =>
  StyleSheet.create({
    pagerView: {
      flex: 1,
    },
  })
