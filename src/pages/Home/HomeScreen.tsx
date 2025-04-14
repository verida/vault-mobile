import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import {
  HomeCryptoWalletOverview,
  HomeGettingStarted,
  HomePromoBanners,
  Icon,
  RecoveryPhraseReminder,
  ScreenWrapper,
  Typography,
} from '~/components'
import { sunsetFeatureFlags } from '~/config'
import { useTheme } from '~/contexts'
import { useConfig } from '~/features/config'
import { useHomeScreenHandlers } from '~/features/homeScreen'
import { useThemeAwareStyle } from '~/hooks'
import { TabsScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type HomeScreenParams = undefined

type HomeScreenProps = TabsScreenProps<'Home'>

export const HomeScreen: React.FunctionComponent<HomeScreenProps> = (
  _props
) => {
  // TODO: Do we display the seed phrase reminder here, like in the previous Home screen?

  useHomeScreenHandlers() // TODO: To uncomment after removing the previous Home screen

  const styles = useThemeAwareStyle(createStyle)
  const { theme } = useTheme()

  const { config } = useConfig()
  const navigation = useNavigation()

  const hideCryptoWalletOverview =
    !sunsetFeatureFlags.enabledBlockchainWallet ||
    config.features.home.hideCryptoWalletOverview
  const hidePromoBanners = true //config.features.home.hidePromoBanners
  const hideGettingStarted = true // config.features.home.hideGettingStarted

  return (
    <>
      <ScreenWrapper
        safeAreaEdges={['left', 'right']}
        backgroundColor={theme.color.snow}>
        <View style={styles.container}>
          <Typography
            variant='h5'
            style={{
              marginBottom: theme.spacing.l,
            }}>
            Verida Wallet is about to sunset. Get yourself ready to the next
            phrase.
          </Typography>

          {hideCryptoWalletOverview ? null : (
            <HomeCryptoWalletOverview style={styles.section} />
          )}
          {hidePromoBanners ? null : (
            <HomePromoBanners
              style={[styles.section, styles.promoBannersSection]}
            />
          )}
          {hideGettingStarted ? null : (
            <HomeGettingStarted
              style={[styles.section, styles.gettingStartedSection]}
            />
          )}

          <View style={styles.section}>
            <Pressable
              style={styles.button}
              onPress={() => {
                navigation.navigate('DisplayPrivateInfo', {
                  source: 'currentVeridaDid',
                  type: 'recoveryPhrase',
                })
              }}>
              <View style={styles.details}>
                <Text style={styles.label}>
                  Back up Verida identity seedphrase
                </Text>
              </View>
              <Icon name='chevron-forward' size={24} />
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => {
                navigation.navigate('ManageWallets')
              }}>
              <View style={styles.details}>
                <Text style={styles.label}>
                  Back up Crypto wallet seedphrases
                </Text>
              </View>
              <Icon name='chevron-forward' size={24} />
            </Pressable>
          </View>
        </View>

        <RecoveryPhraseReminder style={styles.recoveryPhraseReminder} />
      </ScreenWrapper>
    </>
  )
}

const createStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    section: {
      marginBottom: theme.spacing.m,
      gap: theme.spacing.s,
    },
    promoBannersSection: {
      marginLeft: -theme.spacing.m,
      marginRight: -theme.spacing.m,
    },
    gettingStartedSection: {
      flex: 1,
      marginBottom: 0,
    },
    recoveryPhraseReminder: {
      position: 'absolute',
      bottom: theme.spacing.m,
      left: theme.spacing.m,
      right: theme.spacing.m,
    },

    button: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      borderWidth: 1,
      borderRadius: theme.roundness.xs,
      borderColor: '#E0E3EA', // Hardcoded color
      backgroundColor: theme.color.background,
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      marginLeft: theme.spacing.sm,
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.375,
      color: theme.color.onBackground,
    },
  })
