import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'

import { ScreenWrapper } from '~/components'
import {
  ClaimUsernameView,
  ClaimUsernameViewRefProps,
  InputUsernameView,
  InputUsernameViewRefProps,
} from '~/components/PublicProfile'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'

enum PageType {
  InputUsername,
  ClaimUsername,
}

export type ClaimUsernameScreenParams = undefined

type ClaimUsernameScreenProps = MainStackScreenProps<'ClaimUsername'>

export const ClaimUsernameScreen: React.FC<ClaimUsernameScreenProps> = (
  props
) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Username',
    })
  }, [navigation])

  const [currentPage] = useState(PageType.InputUsername)

  const pagerRef = useRef<PagerView>(null)
  const inputUsernameViewRef = useRef<InputUsernameViewRefProps>(null)
  const claimUsernameViewRef = useRef<ClaimUsernameViewRefProps>(null)

  useEffect(() => {
    inputUsernameViewRef.current?.focusInput()
  }, [])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper isModal keyboardAvoiding>
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
    </ScreenWrapper>
  )
}

const createStyles = () =>
  StyleSheet.create({
    pagerView: {
      flex: 1,
    },
  })
