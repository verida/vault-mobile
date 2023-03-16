import { StackActions, useNavigation } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import React, { useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Spacer } from 'components/Spacer'
import TCCheckbox from 'components/TCCheckbox'
import { Headline } from 'components/Typography/Headline'
import { Paragraph } from 'components/Typography/Paragraph'
import { Text } from 'components/Typography/Text'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import TextStyles from 'styles/text'
import { Theme } from 'styles/types'

export enum AddIdentityMode {
  CreateNew,
  Add,
}

const Identity = () => {
  const navigation = useNavigation()
  const params = useParams<{ mode?: AddIdentityMode }>()
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(creatStyles)

  const [agreedTC, setAgreedTC] = useState(false)
  function toggleAgreedTC() {
    setAgreedTC((prevState) => !prevState)
  }

  return (
    <Screen withSafeAreaView>
      <NavigationHeader title='Identity' />
      <View style={[styles.landing, { alignItems: 'center' }]}>
        <View
          style={{
            width: '100%',
            height: 216,
          }}
          pointerEvents={'box-none'}>
          <Image
            style={{
              width: '100%',
              marginTop: -80,
            }}
            source={require('assets/identity-card.png')}
            resizeMode='cover'
          />
        </View>
        <Spacer height={32} />
        <Headline>Create your identity</Headline>
        <Spacer vertical='sm' />
        <Text style={{ textAlign: 'center' }}>
          An identity is a digital representation of yourself. You can have
          multiple, such as a personal, business or anonymous identity.
        </Text>
        <Spacer height={115} />
        <TCCheckbox
          checked={agreedTC}
          style={styles.termAndCondition}
          onToggle={toggleAgreedTC}
        />
        <Spacer vertical='m' />
        <Button
          disabled={!agreedTC}
          style={styles.actionButton}
          onPress={() => {
            navigation.dispatch(StackActions.pop(1))
            navigation.navigate('AddIdentity', { ...params })
          }}>
          Create Identity
        </Button>
        <TouchableOpacity
          disabled={!agreedTC}
          style={[styles.actionButton]}
          onPress={() => {
            navigation.navigate('SeedPhraseEntered', { ...params } as any)
          }}>
          <View style={{ alignItems: 'center' }}>
            <Paragraph style={styles.subTitle}>
              Already have a Verida Identity?
            </Paragraph>
            <Text
              style={{
                ...TextStyles.primaryColor,
                color: theme.color.primary,
              }}>
              Import Identity
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

const creatStyles = (theme: Theme) => {
  return StyleSheet.create({
    main: {
      flex: 1,
      backgroundColor: theme.color.primary50,
    },
    actionButton: {
      width: '100%',
      alignSelf: 'center',
    },
    backButton: {
      position: 'absolute',
      left: theme.spacing.l,
      paddingHorizontal: theme.spacing.l,
    },
    nextButton: {
      position: 'absolute',
      right: theme.spacing.m,
      paddingHorizontal: theme.spacing.l,
    },
    retryButton: {
      position: 'absolute',
      right: 0,
      paddingHorizontal: theme.spacing.l,
      backgroundColor: theme.color.error,
      borderColor: theme.color.error,
      textcolor: theme.color.onError,
    },
    landing: {
      flex: 1,
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
    },
    title: {
      color: theme.color.onBackground,
    },
    subTitle: {
      color: theme.color.textLightGrey,
    },
    termAndCondition: {
      marginTop: theme.spacing.xxxl,
      color: theme.color.onBackground,
    },
    scrollViewContainer: {
      paddingBottom: theme.spacing.xxl,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}

export default Identity
