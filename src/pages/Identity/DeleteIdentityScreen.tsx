import { BottomActionBar, ScreenWrapper } from 'components'
import { selectSelectedAccount, useIdentities } from 'features/identities'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { MainStackScreenProps } from 'navigation/types'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const logger = new Logger('DeleteIdentityScreen')

const title = 'Do you want to delete your Identity?'
const info = `To delete your identity, please remove any record of your recovery phrase then logout of this application or click the "Delete" button below. \n\nVerida has no access to your data and cannot recover your identity.`

export type DeleteIdentityScreenParams = undefined

type DeleteIdentityScreenProps = MainStackScreenProps<'DeleteIdentity'>

// This screen is doing exactly the same as the RemoveIdentity, this is for the app stores that are expecting ways to "log out" and "delete an account" even though it's not relevant for a decentralised identity with a seed phrase.
export const DeleteIdentityScreen: React.FC<DeleteIdentityScreenProps> = (
  props
) => {
  const { navigation } = props

  const [processing, setProcessing] = useState(false)
  useEffect(() => {
    navigation.setOptions({
      title: 'Delete your Identity',
      headerShown: !processing,
      headerBackVisible: false, // TODO: Update when reworking headers
    })
  }, [navigation, processing])

  const styles = useThemeAwareStyle(createStyles)

  const selectedAccount = useAppSelector(selectSelectedAccount) // TODO: Use the dedicated hook when available

  const [canDelete] = useState(!!selectedAccount?.did)

  const { removeIdentity } = useIdentities()

  const handleDeleteConfirmed = useCallback(async () => {
    if (!selectedAccount?.did) {
      return
    }

    setProcessing(true)
    try {
      await removeIdentity(selectedAccount.did)
      navigation.navigate('Tabs', {
        screen: 'Home',
      })
    } catch (error: unknown) {
      logger.error(error)
      setProcessing(false)
    }
  }, [removeIdentity, navigation, selectedAccount?.did])

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
        alertType='warning'
        alertContent='This operation is final, your Identity cannot be recovered without your recovery phrase.'
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancel,
            color: 'grey',
          },
          {
            label: 'Delete',
            onPress: handleDelete,
            disabled: !canDelete,
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
