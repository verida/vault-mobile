import React, { useCallback, useEffect, useState } from 'react'
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native'

import { BottomActionBar, ScreenWrapper, Typography } from '~/components'
import { Checkbox } from '~/components/Input'
import { Spacer } from '~/components/Spacer'
import { Headline } from '~/components/Typography/Headline'
import { Text } from '~/components/Typography/Text'
import { TERMS_AND_CONDITIONS_URL } from '~/constants/application'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type AddIdentityScreenParams = {
  /* If there is no other identity */
  firstIdentity: boolean
}

type AddIdentityScreenProps = MainStackScreenProps<'AddIdentity'>

export const AddIdentityScreen: React.FC<AddIdentityScreenProps> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const styles = useThemeAwareStyle(creatStyles)

  const [isTermsConditionsChecked, setIsTermsConditionsChecked] =
    useState<boolean>(false)

  const handleToggleTCCheckbox = useCallback(() => {
    setIsTermsConditionsChecked((prevState) => !prevState)
  }, [])

  const handleTermsConditionLinkPress = useCallback(async () => {
    const url = TERMS_AND_CONDITIONS_URL
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      Linking.openURL(url)
    }
  }, [])

  const handleCreateIdentityButtonPress = useCallback(() => {
    navigation.replace('CreateIdentity', {
      firstIdentity: params.firstIdentity,
    })
  }, [navigation, params])

  const handleImportIdentityButtonPress = useCallback(() => {
    navigation.replace('ImportIdentity', {
      firstIdentity: params.firstIdentity,
    })
  }, [navigation, params])

  useEffect(() => {
    navigation.setOptions({
      title: 'Identity',
    })
  }, [navigation])

  return (
    <ScreenWrapper>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
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
            source={require('~/assets/identity-card.png')}
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
        <View style={styles.termsConditionsButton}>
          <Checkbox
            checked={isTermsConditionsChecked}
            onToggle={handleToggleTCCheckbox}
          />
          <Typography variant='h5'>I accept the</Typography>
          <Typography
            variant='h5'
            onPress={handleTermsConditionLinkPress}
            style={styles.termsConditionsLink}>
            terms and conditions
          </Typography>
        </View>
      </ScrollView>
      <BottomActionBar
        hideBorder
        actionsOrientation='column'
        actions={[
          {
            label: 'Create Identity',
            onPress: handleCreateIdentityButtonPress,
            disabled: !isTermsConditionsChecked,
          },
          {
            label: 'Import Identity',
            variant: 'secondary',
            onPress: handleImportIdentityButtonPress,
            disabled: !isTermsConditionsChecked,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const creatStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.l,
      flexGrow: 1,
      alignItems: 'center',
    },
    termsConditionsButton: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      alignSelf: 'flex-start',
    },
    termsConditionsLink: {
      color: theme.color.primary,
      textDecorationLine: 'underline',
    },
  })
}
