import React, { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { BottomActionBar, ScreenWrapper } from '~/components'
import LoadingView from '~/components/LoadingView'
import Text from '~/components/Text'
import { selectSelectedAccount, useIdentities } from '~/features/identities'
import { Logger } from '~/features/telemetry'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

const logger = Logger.create('DeleteIdentityScreen')

const title = 'Do you want to delete your Identity?'
const info = `This operation is final!\n\nYour data will be deleted from the Verida Network and your decentralized Identifier will be disabled.\n\nThere is no recovery possible after this operation`

export type DeleteIdentityScreenParams = undefined

type DeleteIdentityScreenProps = MainStackScreenProps<'DeleteIdentity'>

// This screen is doing exactly the same as the RemoveIdentity, this is for the app stores that are expecting ways to "log out" and "delete an account" even though it's not relevant for a decentralised identity with a seed phrase.
export const DeleteIdentityScreen: React.FC<DeleteIdentityScreenProps> = (
  props
) => {
  const { navigation } = props

  const [processing, setProcessing] = useState<boolean>(false)
  useEffect(() => {
    navigation.setOptions({
      title: 'Delete your Identity',
      headerShown: !processing,
      headerLeft: () => null,
    })
  }, [navigation, processing])

  const styles = useThemeAwareStyle(createStyles)

  const selectedAccount = useAppSelector(selectSelectedAccount) // TODO: Use the dedicated hook when available

  const [canDelete] = useState<boolean>(!!selectedAccount?.did)

  const { destroyIdentity } = useIdentities()

  const handleDeleteConfirmed = useCallback(async () => {
    if (!selectedAccount?.did) {
      return
    }

    setProcessing(true)
    try {
      const currentClient = AccountManager.getInstance().getClient()
      if (!currentClient) {
        throw new Error('No current client')
      }
      await destroyIdentity(currentClient, selectedAccount.did)
      // The destroy will trigger the remove of the current Identity which will trigger the switch to a different Identity
      navigation.navigate('Tabs', {
        screen: 'Home',
      })
    } catch (error: unknown) {
      logger.error(error)
      setProcessing(false)
    }
  }, [destroyIdentity, selectedAccount?.did, navigation])

  const handleDelete = useCallback(async () => {
    Alert.alert(
      'Delete Identity',
      'This operation is final! Do you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteConfirmed,
        },
      ]
    )
  }, [handleDeleteConfirmed])

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
        alertType='error'
        alertContent={`This operation is final! Your Identity and data cannot be recovered after.`}
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancel,
            variant: 'secondary',
          },
          {
            label: 'Delete',
            onPress: handleDelete,
            variant: 'danger',
            disabled: !canDelete,
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
