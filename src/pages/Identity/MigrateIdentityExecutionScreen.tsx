import {
  BottomActionBar,
  ScreenWrapper,
  StatusInfo,
  StatusList,
  StatusListItem,
} from 'components'
import {
  MigrateIdentityStep,
  MigrateIdentityStepStatus,
  useCurrentIdentity,
  useMigrateIdentity,
} from 'features/identities'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, InteractionManager, StyleSheet, View } from 'react-native'
import { formatPercentage } from 'utils'

import { useAuth } from 'hooks/useAuth'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

const logger = new Logger('MigrateIdentityExecutionScreen')

const defaultMigrationStepStatus: Array<
  StatusListItem & { key: MigrateIdentityStep }
> = [
  {
    key: 'createDID',
    label: 'Creating your Mainnet Identity',
    status: 'idle',
  },
  {
    key: 'connectIdentity',
    label: 'Connecting to your storage nodes',
    status: 'idle',
  },
  {
    key: 'migrateData',
    label: 'Migrating your data (0%)',
    status: 'idle',
    displayProgressBar: true,
  },
]

type MigrationStatus = 'processing' | 'success' | 'error'

export type MigrateIdentityExecutionScreenParams = undefined

type MigrateIdentityExecutionScreenProps =
  MainStackScreenProps<'MigrateIdentityExecution'>

export const MigrateIdentityExecutionScreen: React.FunctionComponent<MigrateIdentityExecutionScreenProps> =
  (props) => {
    const { navigation } = props

    useEffect(() => {
      navigation.setOptions({
        title: 'Migrate Identity',
        headerShown: false,
      })
    }, [navigation])

    const styles = useThemeAwareStyle(createStyles)

    const [status, setStatus] = useState<MigrationStatus>('processing')
    const [statusItems, setStatusItems] = useState(defaultMigrationStepStatus)

    const updateStepStatus = useCallback(
      (step: MigrateIdentityStep, stepStatus: MigrateIdentityStepStatus) => {
        setStatusItems((prevItems) =>
          prevItems.map((item) =>
            item.key === step ? { ...item, status: stepStatus } : item
          )
        )
      },
      []
    )

    const updateMigrationProgress = useCallback((newProgress) => {
      setStatusItems((prevItems) =>
        prevItems.map((item) =>
          item.key === 'migrateData'
            ? {
                ...item,
                label: `Migrating your data (${formatPercentage(newProgress)})`,
                progress: newProgress,
              }
            : item
        )
      )
    }, [])

    const { switchToAccount, refresh } = useAuth()
    const currentIdentity = useCurrentIdentity()
    const { migrate } = useMigrateIdentity()
    const [newDid, setNewDid] = useState<string | undefined>(undefined)

    const executeMigration = useCallback(async () => {
      try {
        setStatus('processing')
        const migratedDid = await migrate(
          updateStepStatus,
          updateMigrationProgress
        )
        setNewDid(migratedDid)
        setStatus('success')
      } catch (error: unknown) {
        logger.error(error)
        setStatus('error')
      }
    }, [migrate, updateStepStatus, updateMigrationProgress])

    useEffect(() => {
      if (currentIdentity) {
        executeMigration()
      }
    }, [currentIdentity, executeMigration])

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleSwitchToNewIdentity = useCallback(() => {
      if (!newDid) {
        return
      }
      navigation.navigate('Tabs', { screen: 'Home' })

      // TODO: Use switchIdentity from useIdentities
      InteractionManager.runAfterInteractions(async () => {
        try {
          await switchToAccount(newDid)
        } catch (error: unknown) {
          logger.error(
            new Error('Error when switching identity in the drawer', {
              cause: error,
            })
          )
          Alert.alert(
            'Error',
            `Unable to switch to the Identity, please try again later.`
          )

          // Switch back to the current account
          if (currentIdentity?.did) {
            try {
              await switchToAccount(currentIdentity.did)
              await refresh()
            } catch (anotherError: unknown) {
              logger.error(
                new Error(
                  'Error when switching and refreshing identity back to current one in the drawer',
                  {
                    cause: anotherError,
                  }
                )
              )
            }
          }
        }
      })
    }, [newDid, currentIdentity?.did, navigation, refresh, switchToAccount])

    const handleRetry = useCallback(() => {
      if (currentIdentity) {
        setStatus('processing')
        setStatusItems(defaultMigrationStepStatus)
        executeMigration()
      }
    }, [currentIdentity, executeMigration])

    const title =
      status === 'success'
        ? 'Success!'
        : status === 'error'
        ? 'Something went wrong!'
        : 'Migrating your Identity'
    const subtitle =
      status === 'success'
        ? 'Your Identity has been successfully migrated'
        : status === 'error'
        ? 'Please retry'
        : 'Please wait, it can take a few minutes.'

    return (
      <ScreenWrapper allSafeAreaEdges>
        <View style={[styles.container]}>
          <StatusInfo
            statusType={
              status === 'success'
                ? 'success'
                : status === 'error'
                ? 'error'
                : 'processsing'
            }
            title={title}
            subtitle={subtitle}
          />
          <StatusList statusItems={statusItems} style={styles.statusList} />
        </View>
        <BottomActionBar
          hideBorder
          alertType='warning'
          alertContent={
            status === 'processing'
              ? `Please do not close the app! As a decentralized network, your Verida Wallet is performing the operation.`
              : undefined
          }
          actionsOrientation='column'
          actions={
            status === 'success'
              ? [
                  {
                    label: 'Close',
                    onPress: handleClose,
                    color: 'grey',
                  },
                  {
                    label: 'Switch to new Identity',
                    onPress: handleSwitchToNewIdentity,
                  },
                ]
              : status === 'error'
              ? [
                  {
                    label: 'Close',
                    onPress: handleClose,
                    color: 'grey',
                  },
                  {
                    label: 'Retry',
                    onPress: handleRetry,
                  },
                ]
              : []
          }
        />
      </ScreenWrapper>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
    },
    statusList: {
      marginTop: theme.spacing.xxl,
    },
    progressBarContainer: {
      marginTop: theme.spacing.m,
      marginLeft: theme.spacing.s + 20,
    },
  })
