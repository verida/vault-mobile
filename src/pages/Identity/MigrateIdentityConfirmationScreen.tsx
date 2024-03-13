import { BottomActionBar, ScreenWrapper, Typography } from 'components'
import { config } from 'config'
import { canMigrateToMainnet, useCurrentIdentity } from 'features/identities'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import IdentityMigrationIcon from 'assets/icons/identity_migration_icon.svg'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export type MigrateIdentityConfirmationScreenParams = undefined

type MigrateIdentityConfirmationScreenProps =
  MainStackScreenProps<'MigrateIdentityConfirmation'>

export const MigrateIdentityConfirmationScreen: React.FunctionComponent<
  MigrateIdentityConfirmationScreenProps
> = (props) => {
  const { navigation } = props

  const styles = useThemeAwareStyle(createStyles)

  useEffect(() => {
    navigation.setOptions({
      title: 'Migrate Identity',
      headerBackVisible: false, // TODO: Update when reworking headers
    })
  }, [navigation])

  const currentIdentity = useCurrentIdentity()
  const did = currentIdentity?.did

  const canMigrate = did ? canMigrateToMainnet(did) : false

  const handleCancel = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleMigrate = useCallback(() => {
    Alert.alert(
      'Execute migration',
      config.features.veridaMainnet.enableDeletionAfterMigration
        ? 'Your current identity will be deleted. Do you want to proceed?'
        : 'Do you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Do nothing
          },
        },
        {
          text: 'Migrate',
          style: 'destructive',
          onPress: () => {
            navigation.replace('MigrateIdentityExecution')
          },
        },
      ]
    )
  }, [navigation])

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <IdentityMigrationIcon />
          {canMigrate ? (
            <>
              <Typography variant='h2' style={styles.title}>
                Do you want to migrate your Identity to Mainnet?
              </Typography>
              <View style={styles.didWrapper}>
                <Typography variant='h5'>{did}</Typography>
              </View>
              <Typography variant='h5' style={styles.subtitle}>
                {config.features.veridaMainnet.enableDeletionAfterMigration
                  ? `This process will create a corresponding Mainnet Verida Identity and securely transfer your data to the new network.\n\nNote that your currrent identity will be deleted!\n\nPlease ensure that you have backed up any critical information before proceeding.`
                  : `This process will create a corresponding Mainnet Verida Identity and securely transfer your data to the new network.\n\nPlease ensure that you have backed up any critical information before proceeding.`}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant='h2' style={styles.title}>
                {`You can't migrate this identity`}
              </Typography>
              <View style={styles.didWrapper}>
                <Typography variant='h5'>{did}</Typography>
              </View>
              <Typography variant='h5' style={styles.subtitle}>
                Only Testnet Identities can be migrated to Mainnet.
              </Typography>
            </>
          )}
        </ScrollView>
      </View>
      <BottomActionBar
        alertType='error'
        alertContent={
          canMigrate
            ? config.features.veridaMainnet.enableDeletionAfterMigration
              ? 'The migration can take several minutes and the app must stay open.\nYour current identity will be deleted.'
              : 'The migration can take several minutes and the app must stay open.'
            : undefined
        }
        actionsOrientation='row'
        actions={[
          {
            label: 'Cancel',
            color: 'grey',
            onPress: handleCancel,
          },
          {
            label: 'Migrate',
            onPress: handleMigrate,
            disabled: !canMigrate,
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
      paddingHorizontal: theme.spacing.l,
    },
    content: {
      marginTop: 60,
      alignItems: 'center',
    },
    title: {
      marginTop: theme.spacing.m,
    },
    didWrapper: {
      marginTop: theme.spacing.m,

      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      borderRadius: theme.roundness.l,
      backgroundColor: theme.color.primary5,
    },
    subtitle: {
      marginTop: theme.spacing.m,
      opacity: 0.6,
    },
  })
