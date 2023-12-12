import { useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { utils } from 'ethers'
import { MNEMONIC_LENGTH } from 'features/seedphrases'
import { getDefaultVeridaNetwork } from 'features/verida'
import { useThemeAwareStyle } from 'hooks'
import isEmpty from 'lodash/isEmpty'
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, Keyboard, StyleSheet } from 'react-native'

import AccountManager from 'api/AccountManager'
import { FormInput } from 'components/Input/FormInput'
import CustomFooter from 'components/Layouts/CustomFooter'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { NetworkSelectorRadioButtonGroup } from 'components/Network'
import Screen from 'components/Screen'
import { MainStackParams } from 'navigation/types'
import { Theme } from 'styles/types'

import Button from '../../components/Button'
import Layout from '../../components/Layouts/Layout'
import ModifierStyles from '../../styles/modifier'

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

  const [phrase, setPhrase] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, showError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [network, setNetwork] = useState(defaultNetwork)

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

  const onContinue = async () => {
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
        navigation.navigate('CreatePin') // Create a pin for the first time creating an identity
      } else {
        navigation.goBack()
      }
    } catch (cause) {
      showError(true)
    } finally {
      setProcessing(false)
    }
  }

  const title = 'Seed Phrase'
  const label = 'Enter seed phrase'

  return (
    <Screen
      withKeyboardAvoidingView
      navBar={<NavigationHeader title='Import an Identity' />}>
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
      <CustomFooter>
        <Button
          color='primary'
          onPress={onContinue}
          disabled={!verified || processing}
          loading={processing}>
          Continue
        </Button>
      </CustomFooter>
    </Screen>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    networkSelector: {
      marginTop: theme.spacing.l,
    },
  })
