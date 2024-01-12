import {
  BottomActionBar,
  ScreenWrapper,
  StatusInfo,
  StatusList,
  StatusListItem,
} from 'components'
import { config } from 'config'
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'
import {
  MigrateIdentityStep,
  MigrateIdentityStepStatus,
  useCurrentIdentity,
  useIdentities,
  useMigrateIdentity,
} from 'features/identities'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, InteractionManager, StyleSheet, View } from 'react-native'
import { formatPercentage } from 'utils'

import LoadingView from 'components/LoadingView'
import { useAuth } from 'hooks/useAuth'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

const logger = new Logger('MigrateIdentityExecutionScreen')

const defaultMigrationStepStatus: Array<
  StatusListItem & { key: MigrateIdentityStep }
> = [
  {
    key: 'createDID',
    label: 'Creating your Mainnet identity',
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
  {
    key: 'deleteIdentity',
    label: config.features.veridaMainnet.enableDeletionAfterMigration
      ? 'Deleting your current identity'
      : 'Deleting your current identity (skipped)',
    status: 'idle',
    disabled: !config.features.veridaMainnet.enableDeletionAfterMigration,
  },
]

type MigrationStatus = 'processing' | 'success' | 'error'

export type MigrateIdentityExecutionScreenParams = undefined

type MigrateIdentityExecutionScreenProps =
  MainStackScreenProps<'MigrateIdentityExecution'>

export const MigrateIdentityExecutionScreen: React.FunctionComponent<MigrateIdentityExecutionScreenProps> =
  (props) => {
    const { navigation } = props

    const [switchingIdentity, setSwitchingIdentity] = useState(false)
    const [status, setStatus] = useState<MigrationStatus>('processing')

    const { removeIdentity } = useIdentities()

    useEffect(() => {
      navigation.setOptions({
        title: 'Migrate Identity',
        headerShown: false,
        gestureEnabled: false,
      })
    }, [navigation])

    const styles = useThemeAwareStyle(createStyles)

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
      if (switchingIdentity) {
        return
      }

      try {
        setStatus('processing')
        activateKeepAwake()
        const migratedDid = await migrate(
          updateStepStatus,
          updateMigrationProgress
        )
        setNewDid(migratedDid)
        setStatus('success')
      } catch (error: unknown) {
        logger.error(error)
        setStatus('error')
      } finally {
        deactivateKeepAwake()
      }
    }, [switchingIdentity, migrate, updateStepStatus, updateMigrationProgress])

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
            `Unable to switch to the identity, please try again later.`
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

    const handleUseNewIdentity = useCallback(async () => {
      try {
        if (currentIdentity?.did) {
          setSwitchingIdentity(true)
          await removeIdentity(currentIdentity.did, newDid)
          navigation.navigate('Tabs', { screen: 'Home' })
        } else {
          handleSwitchToNewIdentity()
        }
      } catch (error: unknown) {
        logger.error(error)
      }
    }, [
      removeIdentity,
      navigation,
      currentIdentity?.did,
      newDid,
      handleSwitchToNewIdentity,
    ])

    const title =
      status === 'success'
        ? 'Success!'
        : status === 'error'
        ? 'Something went wrong!'
        : 'Migrating your identity'
    const subtitle =
      status === 'success'
        ? 'Your Identity has been successfully migrated'
        : status === 'error'
        ? 'Please retry'
        : 'Please wait, it can take a few minutes.'

    if (switchingIdentity) {
      return <LoadingView />
    }

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
          alertType='error'
          alertContent={
            status === 'processing'
              ? `Please do not close the app!\nAs a decentralized network, your Verida Wallet is performing the migration.`
              : undefined
          }
          actionsOrientation='column'
          actions={
            status === 'success'
              ? config.features.veridaMainnet.enableDeletionAfterMigration
                ? [
                    {
                      label: 'Use new identity',
                      onPress: handleUseNewIdentity,
                    },
                  ]
                : [
                    {
                      label: 'Close',
                      onPress: handleClose,
                      color: 'grey',
                    },
                    {
                      label: 'Switch to new identity',
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
