import React, { useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Spacer } from 'components/Spacer'
import TCCheckbox from 'components/TCCheckbox'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import { DISABLED_COLOR, LIGHTGREY_COLOR, TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export enum AddIdentityMode {
  CreateNew,
  Add,
}

export type AddIdentityScreenParams = {
  mode: AddIdentityMode
}

type AddIdentityScreenProps = MainStackScreenProps<'AddIdentity'>

export const AddIdentityScreen: React.FC<AddIdentityScreenProps> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const styles = useThemeAwareStyle(creatStyles)

  const [agreedTC, setAgreedTC] = useState(false)
  function toggleAgreedTC() {
    setAgreedTC((prevState) => !prevState)
  }

  return (
    <Screen withSafeAreaView>
      <NavigationHeader title='Identity' />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.landing, { alignItems: 'center' }]}>
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
        <Headline>Get your identity</Headline>
        <Spacer vertical='sm' />
        <Text style={{ textAlign: 'center' }}>
          An identity is a digital representation of yourself. You can have
          multiple ones, such as a personal, a business or an anonymous
          identity.
        </Text>
        <Spacer flex={1} />
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
            navigation.replace('CreateIdentity', { mode: params.mode })
          }}>
          Create Identity
        </Button>
        {/* TODO: Create proper reussable buttons of the diffferent variants */}
        <TouchableOpacity
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          disabled={!agreedTC}
          style={[
            styles.actionButton,
            styles.importButton,
            agreedTC ? {} : styles.importButtonDisabled,
          ]}
          onPress={() => {
            navigation.replace('ImportIdentity', {
              mode: params.mode,
            })
          }}>
          <Text
            style={[
              styles.importButtonLabel,
              agreedTC ? {} : styles.importButtonLabelDisabled,
            ]}>
            Import Identity
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    importButton: {
      alignItems: 'center',
      borderRadius: 4,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: LIGHTGREY_COLOR,
    },
    importButtonDisabled: {
      opacity: 0.5,
      borderColor: DISABLED_COLOR,
    },
    importButtonLabel: {
      fontFamily: NUNITO_SANS_BOLD,
      fontSize: 16,
      lineHeight: 24,
      color: TEXT_COLOR,
    },
    importButtonLabelDisabled: {
      color: DISABLED_COLOR,
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
      flexGrow: 1,
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
