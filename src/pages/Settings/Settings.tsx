import { ScreenWrapper } from 'components'
import { useTheme } from 'contexts'
import { useCurrentIdentity } from 'features/identities'
import { canMigrateToMainnet } from 'features/identities/utils/migration'
import { useThemeAwareStyle } from 'hooks'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TextStyle, View } from 'react-native'
import CodePush from 'react-native-code-push'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import PropertyList from 'components/PropertyList'
import Text from 'components/Text'
import { APP_NAME, APP_VERSION_FORMATTED } from 'constants/application'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

type SettingsItem = {
  // TODO: Get it from the props of the component
  label: string
  action?: 'arrow'
  text?: TextStyle
  optional?: boolean
  onPress?: () => void
}

type SettingsCategory = {
  label: string
  subtext?: string
  items: SettingsItem[]
}

export type SettingsScreenParams = undefined

type SettingsScreenProps = MainStackScreenProps<'Settings'>

export const SettingsScreen: React.FC<SettingsScreenProps> = (props) => {
  const { navigation } = props

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  const [walletAppVersion, setWalletAppVersion] = useState(
    `${APP_NAME} ${APP_VERSION_FORMATTED}`
  )

  useEffect(() => {
    navigation.setOptions({
      title: 'Settings',
    })
  }, [navigation])

  const currentIdentity = useCurrentIdentity()

  const displayMigrateToMainnet = currentIdentity?.did
    ? canMigrateToMainnet(currentIdentity.did)
    : false
  const migrateIdentityItem: SettingsItem[] = displayMigrateToMainnet
    ? [
        {
          label: 'Migrate Identity to Mainnet',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('MigrateIdentityConfirmation'),
        },
      ]
    : []

  const settingsItems: SettingsCategory[] = [
    {
      label: 'General',
      items: [
        // General items not related to a given Identity
        {
          label: 'Change PIN',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('ChangePin'),
        },
      ],
    },
    {
      label: 'Identity',
      subtext: currentIdentity?.did,
      items: [
        // Only add items that are related to the current Identity
        {
          label: 'Seed Phrase',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('SeedPhraseView'),
        },
        {
          label: 'Login History',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('LoginHistory'),
        },
        ...migrateIdentityItem,
        {
          label: 'Log Out',
          action: 'arrow',
          text: styles.logoutText,
          optional: true,
          onPress: () => navigation.navigate('RemoveIdentity'),
        },
        {
          label: 'Delete Identity',
          action: 'arrow',
          text: styles.logoutText,
          optional: true,
          onPress: () => navigation.navigate('DeleteIdentity'),
        },
      ],
    },
    {
      label: 'Blockchains',
      items: [
        {
          label: 'Networks',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('BlockchainNetworks'),
        },
        {
          label: 'DApp Connections',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('WalletConnectActiveSessions'),
        },
      ],
    },
    {
      label: 'Polygon ID',
      items: [
        {
          label: 'Status',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('PolygonIdStatus'),
        },
      ],
    },
  ]

  useEffect(() => {
    CodePush.getUpdateMetadata().then((metadata) => {
      metadata &&
        setWalletAppVersion(
          `${APP_NAME} ${APP_VERSION_FORMATTED}\nCodePush ${metadata.label}`
        )
    })
  }, [])

  return (
    <ScreenWrapper
      backgroundColor={theme.color.snow}
      safeAreaEdges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: insets.bottom + theme.spacing.s,
          },
        ]}>
        {settingsItems.map((category) => (
          <View key={category.label} style={styles.categoryContainer}>
            <View style={styles.categoryLabelContainer}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              {category.subtext ? (
                <Text
                  style={styles.categorySubtext}
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {category.subtext}
                </Text>
              ) : null}
            </View>
            <PropertyList list={category.items} />
          </View>
        ))}

        <Text style={styles.appVersion}>{walletAppVersion}</Text>
      </ScrollView>
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.m,
    },
    categoryContainer: {
      marginTop: theme.spacing.l,
    },
    categoryLabelContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.s,
    },
    categoryLabel: {
      fontSize: theme.fontSize.s,
      fontFamily: theme.fontFamily.bold,
      color: theme.color.black600,
      textTransform: 'uppercase',
    },
    categorySubtext: {
      flex: 1,
      marginLeft: theme.spacing.s,
      fontSize: theme.fontSize.s,
      fontFamily: theme.fontFamily.bold,
      color: theme.color.black600,
    },
    logoutText: {
      color: theme.color.orange,
    },
    appVersion: {
      textAlign: 'center',
      color: theme.color.black,
      marginTop: theme.spacing.l,
    },
  })
