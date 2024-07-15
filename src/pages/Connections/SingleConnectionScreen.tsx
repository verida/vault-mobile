import { Content, Icon } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import DataConnectorsManager from '~/api/DataConnectorsManager'
import { ScreenWrapper } from '~/components'
import Button from '~/components/Button'
import Text from '~/components/Text'
import { SUCCESS_COLOR } from '~/constants/color'
import { MainStackScreenProps } from '~/navigation/types'

const calculateNextSync = function (connection: any) {
  // TODO: Better typing
  if (!connection.syncNext) return

  const duration = connection.duration(connection.syncNext)

  if (duration > 0) return 'now'

  return duration.humanize()
}

export type SingleConnectionScreenParams = {
  provider: string
  connectNow?: boolean
  accessToken?: string // TODO: Check this params that was never defined, so I put a likely string type but not sure
}

type SingleConnectionScreenProps = MainStackScreenProps<'SingleConnection'>

export const SingleConnectionScreen: React.FC<SingleConnectionScreenProps> = (
  props
) => {
  const {
    navigation,
    route: { params },
  } = props
  const { provider, connectNow, accessToken } = params

  const connectionInfo = DataConnectorsManager.getConnectionInfo(provider)

  useEffect(() => {
    navigation.setOptions({
      title: 'Connect ' + connectionInfo.label,
    })
  }, [navigation, connectionInfo])

  const [syncStatus, setSyncStatus] = useState<string>('')
  const [nextSync, setNextSync] = useState<string>('')
  const [lastSync, setLastSync] = useState<string>('')
  const [syncError, setSyncError] = useState<string>('')
  const [showSuccess, setShowSuccess] = useState<boolean>(
    !!provider && !!accessToken
  )

  useEffect(() => {
    const setState = (connection: any) => {
      // TODO: Better typing
      setSyncStatus(connection.syncStatus)
      setNextSync(calculateNextSync(connection))
      setLastSync(connection.duration(connection.syncLast).humanize())
      setSyncError(connection.syncLastError)
    }

    const load = async () => {
      setShowSuccess(!!provider && !!accessToken)

      if (accessToken) {
        // @todo: hide this after a while
        DataConnectorsManager.authComplete(provider, params)
      }

      // upgrade our connection object to be a real connection instance from
      // the DataConnectorsManager so we can call sync() etc.
      const connectionInstance =
        await DataConnectorsManager.getConnection(provider)
      setState(connectionInstance)
    }
    load()

    DataConnectorsManager.on('connectionUpdated', (connection: any) => {
      // TODO: Better typing
      setState(connection)
      setShowSuccess(false)
    })
    // TODO: We should be sensitive to more than just accessToken here.
    //       We're disabling this error for backwards compatibility until this
    //       can be tested properly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  useEffect(() => {
    if (connectNow) {
      // eslint-disable-next-line no-void
      void (async () => {
        const connectionInstance =
          await DataConnectorsManager.getConnection(provider)
        await connectionInstance.initiateAuth()
      })()
    }
  }, [connectNow, provider])

  // @todo: can we store connectionInstance somewhere and reuse it?
  const onPressConnect = async () => {
    const connectionInstance =
      await DataConnectorsManager.getConnection(provider)
    return connectionInstance.initiateAuth()
  }
  const onPressSync = async () => {
    const connectionInstance =
      await DataConnectorsManager.getConnection(provider)
    connectionInstance.sync()
  }
  const onPressDisconnect = async () => {
    const connectionInstance =
      await DataConnectorsManager.getConnection(provider)
    connectionInstance.disconnect()
  }

  return (
    <ScreenWrapper>
      <Content contentContainerStyle={styles.contentContainer}>
        {Boolean(showSuccess) && (
          <View style={styles.successMessage}>
            <Icon name='checkmark-circle' style={styles.successMessageIcon} />
            <Text style={styles.successMessageText}>
              Connection successfully established.
            </Text>
          </View>
        )}
        <View style={styles.connectHeader}>
          <Image style={styles.itemIcon} source={connectionInfo.icon} />
          <View style={styles.actionButtons}>
            {syncStatus === 'disabled' ? (
              <Button
                color='transparent-border'
                style={styles.actionButton}
                onPress={onPressConnect}>
                Connect
              </Button>
            ) : (
              <>
                <Button
                  color='transparent-border'
                  style={styles.actionButton}
                  onPress={onPressDisconnect}>
                  Disconnect
                </Button>
                <Button
                  color='transparent-border'
                  style={styles.actionButton}
                  onPress={onPressSync}
                  disabled={syncStatus === 'syncing'}>
                  Sync
                </Button>
              </>
            )}
          </View>
        </View>
        {syncStatus !== 'disabled' && (
          <View style={styles.infoText}>
            <Text>Status: {syncStatus}</Text>
            {lastSync ? <Text>Last sync: {lastSync} ago</Text> : undefined}
            {nextSync ? <Text>Next sync: {nextSync}</Text> : undefined}
            {syncError ? <Text>Error message: {syncError}</Text> : undefined}
            <Text style={styles.disclaimer}>
              * During the developer preview, only the most recent 20 records
              are synchronized
            </Text>
          </View>
        )}
      </Content>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  successMessage: {
    backgroundColor: SUCCESS_COLOR,
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  successMessageIcon: { color: '#fff', marginRight: 10 },
  successMessageText: { color: '#FFF', flex: 1 },
  itemIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginTop: 10,
    marginBottom: 20,
  },
  connectHeader: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: { flex: 1, marginHorizontal: 10 },
  disclaimer: { marginTop: 20, fontSize: 11 },
  infoText: { alignItems: 'flex-start', paddingHorizontal: 20 },
})
