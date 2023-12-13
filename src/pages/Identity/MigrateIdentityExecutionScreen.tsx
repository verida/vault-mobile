import {
  BottomActionBar,
  ProgressBar,
  ScreenWrapper,
  StatusInfo,
  StatusList,
  StatusListItem,
} from 'components'
import { useTheme } from 'contexts'
import {
  MigrateIdentityStep,
  MigrateIdentityStepStatus,
  useCurrentIdentity,
  useMigrateIdentity,
} from 'features/identities'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { formatPercentage } from 'utils'

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
    label: 'Migrating your data',
    status: 'idle',
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
    const { theme } = useTheme()

    const [status, setStatus] = useState<MigrationStatus>('processing')
    const [statusItems, setStatusItems] = useState(defaultMigrationStepStatus)
    const [migrationProgress, setMigrationprogress] = useState(0)

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
      setMigrationprogress(newProgress)
      setStatusItems((prevItems) =>
        prevItems.map((item) =>
          item.key === 'migrateData'
            ? {
                ...item,
                label: `Migrating your data (${formatPercentage(newProgress)})`,
              }
            : item
        )
      )
    }, [])

    const identity = useCurrentIdentity()
    const { migrate } = useMigrateIdentity()

    const executeMigration = useCallback(
      async (did: string) => {
        try {
          setStatus('processing')
          await migrate(did, updateStepStatus, updateMigrationProgress)
          setStatus('success')
        } catch (error: unknown) {
          logger.error(error)
          setStatus('error')
        }
      },
      [migrate, updateStepStatus, updateMigrationProgress]
    )

    useEffect(() => {
      if (identity) {
        executeMigration(identity.did)
      }
    }, [identity, executeMigration])

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleSwitchToNewIdentity = useCallback(() => {
      // TODO: Connect with the new Identity
      navigation.goBack()
    }, [navigation])

    const handleRetry = useCallback(() => {
      if (identity) {
        setStatus('processing')
        setStatusItems(defaultMigrationStepStatus)
        setMigrationprogress(0)
        executeMigration(identity.did)
      }
    }, [identity, executeMigration])

    const isMigratingData = statusItems.some(
      (item) => item.key === 'migrateData' && item.status === 'processing'
    )

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
          {isMigratingData ? (
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={migrationProgress}
                color={theme.color.success}
              />
            </View>
          ) : null}
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
