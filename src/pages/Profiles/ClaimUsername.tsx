import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import ClaimUsernamePage, {
  ClaimUsernamePageRefProps,
} from 'components/Username/ClaimUsernamePage'
import InputUsernamePage, {
  InputUsernamePageRefProps,
} from 'components/Username/InputUsernamePage'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

enum PageType {
  InputUsername,
  ClaimUsername,
}

const ClaimUsername = () => {
  const styles = useThemeAwareStyle(createStyles)
  const [currentPage] = useState(PageType.InputUsername)
  const pagerRef = useRef<PagerView>(null)
  const inputUsernamePageRef = useRef<InputUsernamePageRefProps>(null)
  const claimUsernamePageRef = useRef<ClaimUsernamePageRefProps>(null)

  useEffect(() => {
    inputUsernamePageRef.current?.focusInput()
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
        <InputUsernamePage
          ref={inputUsernamePageRef}
          onClaimUsername={(newUsername) => {
            pagerRef.current?.setPage(PageType.ClaimUsername)
            claimUsernamePageRef.current?.claimUsername(newUsername)
          }}
        />

        {/* ClaimUsername */}
        <ClaimUsernamePage ref={claimUsernamePageRef} />
      </PagerView>
    </Screen>
  )
}

export default ClaimUsername

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pagerView: {
      flex: 1,
    },
  })
