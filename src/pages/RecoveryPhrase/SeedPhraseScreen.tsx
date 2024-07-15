import { Content } from 'native-base'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet } from 'react-native'

import SafeImg from '~/assets/safe.svg'
import { BottomActionBar, ScreenWrapper } from '~/components'
import Layout from '~/components/Layouts/Layout'
import Text from '~/components/Text'
import { MainStackScreenProps } from '~/navigation/types'

export type SeedPhraseScreenParams = undefined

type SeedPhraseScreenProps = MainStackScreenProps<'SeedPhrase'>

// TODO: To rework, take inspiration from DisplayPrivateInfoScreen
export const SeedPhraseScreen: React.FC<SeedPhraseScreenProps> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Record your Seed Phrase',
    })
  }, [navigation])

  const handleRemindLaterButtonPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleRecordSeedPhraseButtonPress = useCallback(() => {
    navigation.replace('SeedPhraseGenerated')
  }, [navigation])

  return (
    <ScreenWrapper>
      <Content>
        <Layout title='Seed Phrase'>
          <Text style={style.description}>
            A seed phrase is the only way to recover access to your account if
            your phone is lost, stolen, broken or upgraded.
          </Text>
          <SafeImg style={{ marginVertical: 28, alignSelf: 'center' }} />
          <Text style={style.description}>
            Your seed phrase is a list of words. Please record them carefully
            and store in a safe place.
          </Text>
        </Layout>
      </Content>
      <BottomActionBar
        hideBorder
        alertType='warning'
        alertContent='Your seed phrase is the only way to recover your identity.'
        actionsOrientation='column'
        actions={[
          {
            label: 'Record Seed Phrase',
            onPress: handleRecordSeedPhraseButtonPress,
          },
          {
            label: 'Remind me later',
            onPress: handleRemindLaterButtonPress,
            variant: 'secondary',
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const style = StyleSheet.create({
  description: {
    marginTop: 16,
  },
})
