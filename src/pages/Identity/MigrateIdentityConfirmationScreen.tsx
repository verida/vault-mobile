import { BottomActionBar, ScreenWrapper, Typography } from 'components'
import { canMigrateToMainnet, useCurrentIdentity } from 'features/identities'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import IdentityMigrationIcon from 'assets/icons/identity_migration_icon.svg'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export type MigrateIdentityConfirmationScreenParams = undefined

type MigrateIdentityConfirmationScreenProps =
  MainStackScreenProps<'MigrateIdentityConfirmation'>

export const MigrateIdentityConfirmationScreen: React.FunctionComponent<MigrateIdentityConfirmationScreenProps> =
  (props) => {
    const { navigation } = props

    const styles = useThemeAwareStyle(createStyles)

    useEffect(() => {
      navigation.setOptions({
        title: 'Migrate your Identity',
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
      navigation.navigate('MigrateIdentityExecution')
    }, [navigation])

    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <View style={styles.content}>
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
                  This process will create a corresponding Mainnet Identity and
                  securely transfer your data to the new network. Please ensure
                  that you have backed up any critical information before
                  proceeding.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant='h2' style={styles.title}>
                  {`You can't migrate this Identity`}
                </Typography>
                <View style={styles.didWrapper}>
                  <Typography variant='h5'>{did}</Typography>
                </View>
                <Typography variant='h5' style={styles.subtitle}>
                  Only Testnet Identities can be migrated to Mainnet.
                </Typography>
              </>
            )}
          </View>
        </View>
        <BottomActionBar
          alertType='warning'
          alertContent={
            canMigrate
              ? 'The migration can take several minutes and you must keep the app open'
              : undefined
          }
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
