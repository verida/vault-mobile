import { StackActions, useNavigation } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import React, { useRef, useState } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import SuccessTick from 'assets/success_tick.svg'
import Container from 'components/Container'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import Button from '../../components/Button'

enum PageType {
  InvitationSuccess,
  SuggestClaimmUsername,
}

const VeridaOneInvitationSuccess = () => {
  const navigation = useNavigation()
  const { bottom } = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [currentPage] = useState(PageType.InvitationSuccess)
  const pagerRef = useRef<PagerView>(null)

  return (
    <Screen
      navBar={
        <NavigationHeader
          title={
            currentPage === PageType.InvitationSuccess
              ? 'Invitation Code'
              : 'Claim your username'
          }
          left={{ icon: 'close' }}
        />
      }>
      <PagerView
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        ref={pagerRef}>
        <Container key='VeridaOneInvitationSuccess'>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: theme.spacing.xxl,
              paddingTop: theme.spacing.l,
              paddingHorizontal: theme.spacing.m,
            }}>
            <View
              style={{
                width: 128,
                height: 128,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginTop: 56,
                marginBottom: theme.spacing.xl,
              }}>
              <SuccessTick />
            </View>
            <Headline
              style={{
                alignSelf: 'center',
                fontSize: 28,
                marginBottom: theme.spacing.sm,
              }}>
              Invitation confirmed
            </Headline>
            <Text
              style={[
                {
                  alignSelf: 'center',
                  fontSize: theme.fontSize.l,
                  color: theme.color.textLightGrey,
                },
              ]}>
              You now have access to Verida One
            </Text>
          </ScrollView>
          <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
            <Button
              style={styles.button}
              onPress={() => pagerRef.current?.setPage(1)}>
              Next
            </Button>
          </View>
        </Container>
        <Container key='SuggestClaimUsername'>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: theme.spacing.xxl,
              paddingTop: theme.spacing.l,
              paddingHorizontal: theme.spacing.m,
            }}>
            <View
              style={{
                width: 216,
                height: 216,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginTop: 56,
                marginBottom: theme.spacing.xl,
              }}>
              <Image
                resizeMode='cover'
                source={require('assets/blur_circle_big.png')}
                style={{ position: 'absolute' }}
              />
              <Image
                resizeMode='cover'
                source={require('assets/username_placehoder.png')}
                style={{ position: 'absolute', width: 177, height: 189 }}
              />
            </View>
            <Headline
              style={{
                alignSelf: 'center',
                fontSize: 28,
                marginBottom: theme.spacing.sm,
              }}>
              Invitation confirmed
            </Headline>
            <Text
              style={[
                {
                  alignSelf: 'center',
                  fontSize: theme.fontSize.l,
                  color: theme.color.textLightGrey,
                },
              ]}>
              You now have access to Verida One
            </Text>
          </ScrollView>
          <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
            <Button
              color='transparent-border'
              style={styles.button}
              onPress={() => navigation.goBack()}>
              Claim Later
            </Button>
            <Button
              style={styles.button}
              onPress={() => {
                navigation.dispatch(StackActions.replace('ClaimUsername'))
              }}>
              Claim Now
            </Button>
          </View>
        </Container>
      </PagerView>
    </Screen>
  )
}

export default VeridaOneInvitationSuccess

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    bottomNavContainer: {
      width: '100%',
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.m,
    },
    button: {
      height: 48,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.s,
      marginBottom: 0,
    },
    pagerView: {
      flex: 1,
    },
  })
