import { BottomActionBar, ScreenWrapper } from 'components'
import { selectSelectedAccount, useIdentities } from 'features/identities'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { MainStackScreenProps } from 'navigation/types'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const logger = new Logger('RemoveIdentityScreen')

const title = 'Do you want to log out?'
const info = `Logging out will remove this Identity from your wallet, but you can always add it back by importing your recovery phrase. \n\nVerida has no access to your data and cannnot recover your Identity. \n\nMake sure to backup your recovery phrase or you won't be able to import and recover your Identity.`

export type RemoveIdentityScreenParams = undefined

type RemoveIdentityScreenProps = MainStackScreenProps<'RemoveIdentity'>

// This screen is called RemoveIdentity as technically it simply remove it from the Wallet but to avoid trouble with the app stores, we say "Log out" in the UI.
// Also, this screen is doing exactly the same as the DeleteIdentity, again this is for the app stores that are expecting ways to "log out" and "delete an account" even though it's not relevant for a decentralised identity with a seed phrase.
export const RemoveIdentityScreen: React.FC<RemoveIdentityScreenProps> = (
  props
) => {
  const { navigation } = props

  const [processing, setProcessing] = useState(false)
  useEffect(() => {
    navigation.setOptions({
      title: 'Log out',
      headerShown: !processing,
      headerBackVisible: false, // TODO: Update when reworking headers
    })
  }, [navigation, processing])

  const styles = useThemeAwareStyle(createStyles)

  const selectedAccount = useAppSelector(selectSelectedAccount) // TODO: Use the dedicated hook when available

  const [canRemove] = useState(!!selectedAccount?.did)

  const { removeIdentities } = useIdentities()

  const handleLogout = useCallback(async () => {
    if (!selectedAccount?.did) {
      return
    }
    setProcessing(true)
    try {
      await removeIdentities([selectedAccount.did])
      navigation.navigate('Tabs', {
        screen: 'Home',
      })
    } catch (error: unknown) {
      logger.error(error)
    } finally {
      setProcessing(false)
    }
  }, [removeIdentities, navigation, selectedAccount?.did])

  const handleCancel = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  if (processing) {
    return <LoadingView />
  }

  // TODO: This screen was quickly reworked without a proper design for our designers. We should ask for a design and update it again.
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {selectedAccount?.did ? (
            <View style={styles.didWrapper}>
              <Text style={styles.did}>{selectedAccount.did}</Text>
            </View>
          ) : null}
          <Text style={styles.subTitle}>{info}</Text>
        </View>
      </ScrollView>
      <BottomActionBar
        alertType='warning'
        alertContent='Backup your recovery phrase before logging out'
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancel,
            color: 'grey',
          },
          {
            label: 'Log out',
            onPress: handleLogout,
            disabled: !canRemove,
            color: 'danger',
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.m,
    },
    title: {
      marginTop: theme.spacing.xxl,
      fontFamily: theme.fontFamily.bold,
      fontSize: 28,
      lineHeight: 28 * 1.3,
    },
    didWrapper: {
      marginTop: theme.spacing.xxl,
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      borderRadius: theme.roundness.l,
      backgroundColor: theme.color.primary5,
    },
    did: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.5,
    },
    subTitle: {
      marginTop: theme.spacing.xxl,
      paddingHorizontal: 2, // Adjustment for a weird look with the rounded box above
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.5,
    },
  })
