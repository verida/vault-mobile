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
import { StyleSheet, View } from 'react-native'

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

    const identity = useCurrentIdentity()
    const { migrate } = useMigrateIdentity()

    const executeMigration = useCallback(
      async (did: string) => {
        try {
          setStatus('processing')
          await migrate(did, updateStepStatus)
          setStatus('success')
        } catch (error: unknown) {
          logger.error(error)
          setStatus('error')
        }
      },
      [migrate, updateStepStatus]
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
      // TODO: Ensure to connect with the new Identity
      navigation.goBack()
    }, [navigation])

    const handleRetry = useCallback(() => {
      //
    }, [])

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
          {/* TODO: Implement data migration progress */}
        </View>
        <BottomActionBar
          hideBorder
          alertType='warning'
          alertContent={
            status === 'processing' ? `Do not close the application` : undefined
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
          // TODO: Allow fine-tunning BottomActionBar with optional actions and action orientation configuration
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
  })
