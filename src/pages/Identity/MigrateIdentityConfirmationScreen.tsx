import { BottomActionBar, ScreenWrapper, Typography } from 'components'
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
        title: 'Migrate Identity',
        headerBackVisible: false, // TODO: Update when reworking headers
      })
    }, [navigation])

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
            <Typography
              variant='h2'
              style={styles.title}
              transform='capitalize'>
              Do you want to migrate your testnet Identity?
            </Typography>
            <Typography variant='h5' style={styles.subtitle}>
              This process will create a corresponding Mainnet Identity and
              securely transfer your data to the new network. Please ensure that
              you have backed up any critical information before proceeding.
            </Typography>
          </View>
        </View>
        <BottomActionBar
          alertType='warning'
          alertContent='The migration can take several minutes and you must keep the app open'
          actions={[
            {
              label: 'Cancel',
              color: 'grey',
              onPress: handleCancel,
            },
            {
              label: 'Migrate',
              onPress: handleMigrate,
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
      marginTop: 80,
      alignItems: 'center',
    },
    title: {
      marginTop: theme.spacing.m,
    },
    subtitle: {
      marginTop: theme.spacing.m,
      opacity: 0.6,
    },
  })
