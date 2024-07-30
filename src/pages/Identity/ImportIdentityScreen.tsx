import { useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Network } from '@verida/types'
import { utils } from 'ethers'
import isEmpty from 'lodash/isEmpty'
import { Content } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Keyboard, StyleSheet } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { BottomActionBar, ScreenWrapper } from '~/components'
import { FormInput } from '~/components/Input/FormInput'
import Layout from '~/components/Layouts/Layout'
import { NetworkSelectorRadioButtonGroup } from '~/components/Network'
import { MNEMONIC_LENGTH } from '~/features/seedphrases'
import { getDefaultVeridaNetwork } from '~/features/verida'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackParams } from '~/navigation/types'
import ModifierStyles from '~/styles/modifier'
import { Theme } from '~/styles/types'

const cleanSeedPhrase = (phrase: string): string => {
  return phrase.trim().replace(/\s\s+/g, ' ')
}

const verifySeedPhrase = (splitted: string[]): boolean => {
  if (!isEmpty(splitted)) {
    return (
      splitted.length === MNEMONIC_LENGTH &&
      splitted[splitted.length - 1].length > 0
    )
  } else {
    return false
  }
}

export type ImportIdentityScreenParams = {
  firstIdentity: boolean
}

type ImportIdentityScreenProps = NativeStackScreenProps<
  MainStackParams,
  'ImportIdentity'
>

export const ImportIdentityScreen: React.FC<ImportIdentityScreenProps> = (
  props
) => {
  const {
    route: { params },
  } = props
  const navigation = useNavigation() // TODO: Take it from the props once we have combined the MainStackNavigator and the AuthStackNavigator

  const defaultNetwork = getDefaultVeridaNetwork()

  const styles = useThemeAwareStyle(createStyles)

  const [phrase, setPhrase] = useState<string>('')
  const [verified, setVerified] = useState<boolean>(false)
  const [error, showError] = useState<boolean>(false)
  const [processing, setProcessing] = useState<boolean>(false)
  const [network, setNetwork] = useState<Network>(defaultNetwork)

  useEffect(() => {
    const verify = () => {
      showError(false)

      const cleanedPhrase = cleanSeedPhrase(phrase)
      const splitted = !isEmpty(cleanedPhrase)
        ? cleanedPhrase.trim().split(' ')
        : []

      const isVerified = verifySeedPhrase(splitted)
      setVerified(isVerified)
    }

    verify()
  }, [phrase])

  const handleContinuePress = useCallback(async () => {
    try {
      Keyboard.dismiss()
      setProcessing(true)
      const cleanedPhrase = cleanSeedPhrase(phrase)
      const isValid = utils.isValidMnemonic(cleanedPhrase)
      if (!isValid) {
        throw new Error('Invalid seed phrase')
      }
      const result = await AccountManager.getInstance().importAccount(
        cleanedPhrase,
        network
      )
      if (!result) {
        Alert.alert('Failed', 'Account already exist')
      }

      if (params.firstIdentity) {
        // FIXME: CreateidentityScreen is in both AuthNavigator and MainNavigator but here it's calling 'CreatePin' which is only in AuthNavigator. Even if it's controlled by 'firstIdentity' param, it's still a risk of bug.
        navigation.navigate('CreatePin') // Create a pin for the first time creating an identity
      } else {
        navigation.goBack()
      }
    } catch (cause) {
      showError(true)
    } finally {
      setProcessing(false)
    }
  }, [navigation, phrase, network, params.firstIdentity])

  useEffect(() => {
    navigation.setOptions({
      title: 'Import an Identity',
    })
  }, [navigation])

  const title = 'Seed Phrase'
  const label = 'Enter seed phrase'

  return (
    <ScreenWrapper keyboardAvoiding>
      <Content>
        <Layout title={title}>
          <FormInput
            value={phrase}
            autoFocus
            multiline
            editable={!processing}
            autoCorrect={false}
            label={label}
            autoCapitalize='none'
            errorMessage={
              !error
                ? undefined
                : 'That does not appear to be a valid seed phrase that was exported from the Verida Wallet, please try again'
            }
            onChangeText={setPhrase}
            style={[error && ModifierStyles.error]}
            inputStyle={{ minHeight: 68 }}
            placeholder={'eg. Open despair creek road again ice least'}
          />
          <NetworkSelectorRadioButtonGroup
            selectedNetwork={network}
            onSelectionChange={setNetwork}
            style={styles.networkSelector}
          />
        </Layout>
      </Content>
      <BottomActionBar
        hideBorder
        actions={[
          {
            label: 'Continue',
            onPress: handleContinuePress,
            disabled: !verified || processing,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    networkSelector: {
      marginTop: theme.spacing.l,
    },
  })
