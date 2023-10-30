import * as sentry from '@sentry/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { logout } from 'features/auth'
import { selectSelectedAccount } from 'features/identities'
import { ForcedCreateAccountType } from 'features/remoteConfig'
import React, { useState } from 'react'
import { Linking, Modal, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'

import Texture from 'assets/landing-bg.svg'
import Logo from 'assets/logo.svg'
import Button from 'components/Button'
import { Spacer } from 'components/Spacer'
import { Paragraph } from 'components/Typography/Paragraph'
import { Title } from 'components/Typography/Title'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { navigate } from 'navigation/RootNavigator'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

type Props = {
  dismissModal: () => void
  forcedCreateAccount: ForcedCreateAccountType
  did?: string
  forcedSignOut: () => Promise<boolean>
}

const ForcedCreateNewAccountModal = ({
  forcedCreateAccount,
  dismissModal,
  forcedSignOut,
}: Props) => {
  const styles = useThemeAwareStyle(createStyles)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const selectedAccount = useAppSelector(selectSelectedAccount)

  const onForcedCreateAccountPress = async () => {
    // Log out
    setLoading(true)
    dispatch(logout({ did: selectedAccount?.did }))

    await forcedSignOut()
    setLoading(false)
    dismissModal()

    navigate('Start', undefined)
  }

  const onFurtherInfoPress = () => {
    Linking.canOpenURL(forcedCreateAccount.furtherInfo!)
      .then(() => {
        Linking.openURL(forcedCreateAccount.furtherInfo!)
      })
      .catch((error) => {
        sentry.captureException(error)
      })
  }

  return (
    <Modal animationType='fade' transparent visible>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#0E1572', '#1467CB', '#1995CB']}
          style={styles.landing}>
          <Texture width={425} height={428} />
          <View style={styles.backgroundContainer}>
            <Logo width={156} height={52} />
          </View>
        </LinearGradient>
        <View style={styles.container}>
          <View style={styles.card}>
            <Title style={styles.title}>New Account Required</Title>
            <Spacer vertical='m' />
            <View style={styles.hline} />
            <Spacer vertical='m' />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <Paragraph>{forcedCreateAccount?.message ?? ''}</Paragraph>
            </ScrollView>
            <View style={styles.footer}>
              <Button
                color='primary'
                loading={loading}
                onPress={() => onForcedCreateAccountPress()}>
                Create New Account
              </Button>
              <Button color='grey' onPress={onFurtherInfoPress}>
                Learn more
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ForcedCreateNewAccountModal

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: '10%',
      paddingVertical: '20%',
      backgroundColor: theme.color.overlay,
    },
    card: {
      backgroundColor: theme.color.surface,
      borderRadius: 20,
      width: '100%',
      minHeight: '60%',
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    scrollViewContainer: {
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.m,
    },
    title: {
      paddingHorizontal: theme.spacing.m,
      marginTop: theme.spacing.m,
    },
    hline: {
      height: StyleSheet.hairlineWidth,
      width: '100%',
      backgroundColor: theme.color.separator,
    },
    footer: {
      backgroundColor: theme.color.surface,
      width: '100%',
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
      padding: theme.spacing.m,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    landing: { ...StyleSheet.absoluteFillObject },
    backgroundContainer: {
      position: 'absolute',
      paddingHorizontal: 24,
      paddingVertical: 77,
      height: '100%',
      width: '100%',
      justifyContent: 'space-between',
    },
  })
}
