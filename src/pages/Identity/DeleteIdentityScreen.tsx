import { BottomActionBar, ScreenWrapper } from 'components'
import { selectSelectedAccount, useIdentities } from 'features/identities'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { MainStackScreenProps } from 'navigation/types'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const title = 'Do you want to delete your Identity?'
const info =
  'To delete your identity, please remove any record of your recovery phrase then logout of this application or click the "Delete" button below.'

export type DeleteIdentityScreenParams = undefined

type DeleteIdentityScreenProps = MainStackScreenProps<'DeleteIdentity'>

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

  const { removeIdentities } = useIdentities()

  const handleDelete = useCallback(async () => {
    if (!selectedAccount?.did) {
      return
    }
    setProcessing(true)
    try {
      await removeIdentities([selectedAccount.did])
      navigation.navigate('Tabs', {
        screen: 'Home',
      })
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
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {selectedAccount?.did ? (
            <View style={styles.didWrapper}>
              <Text style={styles.did}>{selectedAccount.did}</Text>
            </View>
          ) : null}
          <Text style={styles.subTitle}>{info}</Text>
        </View>
      </View>
      <BottomActionBar
        alertType='warning'
        alertContent='This operation is final. Verida has no access to your data and cannot recover your identity without your recovery phrase.'
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
