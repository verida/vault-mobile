import { Container, Icon, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import Text from 'components/Text'
import { View, StyleSheet, Image } from 'react-native'
import DataConnectorsManager from 'api/DataConnectorsManager'

import { SUCCESS_COLOR } from 'constants/color'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Button from 'components/Button'
import moment from 'moment'

const calculateNextSync = function(conn) {
  if (!conn.syncNext) {
    return
  }

  const duration = conn.duration(conn.syncNext)
  if (duration > 0) {
    return 'now'
  }

  return duration.humanize()
}

export default ({ route, navigation }) => {
  const provider = route.params.provider
  const connectionInfo = DataConnectorsManager.getConnectionInfo(provider)

  const [syncStatus, setSyncStatus] = useState('')
  const [nextSync, setNextSync] = useState('')
  const [lastSync, setLastSync] = useState('')
  const [syncError, setSyncError] = useState('')
  const [showSuccess, setShowSuccess] = useState(route.params && route.params.provider && route.params.accessToken)

  useEffect(() => {
    const setState = (connection) => {
      setSyncStatus(connection.syncStatus)
      setNextSync(calculateNextSync(connection))
      setLastSync(connection.duration(connection.syncLast).humanize())
      setSyncError(connection.syncLastError)
    }

    const load = async () => {
      setShowSuccess(route.params && route.params.provider && route.params.accessToken)

      if (route.params && route.params.accessToken) {
        // @todo: hide this after a while
        DataConnectorsManager.authComplete(provider, route.params)
      }

      // upgrade our connection object to be a real connection instance from
      // the DataConnectorsManager so we can call sync() etc.
      const connectionInstance = await DataConnectorsManager.getConnection(provider)
      setState(connectionInstance)
    }
    load()

    DataConnectorsManager.on('connectionUpdated', (conn) => {
      setState(conn)
      setShowSuccess(false)
    })
  }, [route.params.accessToken])

  // @todo: can we store connectionInstance somewhere and reuse it?
  const onPressConnect = async () => {
    const connectionInstance = await DataConnectorsManager.getConnection(provider)
    connectionInstance.initiateAuth()
  }
  const onPressSync = async () => {
    const connectionInstance = await DataConnectorsManager.getConnection(provider)
    connectionInstance.sync()
  }
  const onPressDisconnect = async () => {
    const connectionInstance = await DataConnectorsManager.getConnection(provider)
    connectionInstance.disconnect()
  }

  return (
    <Container>
      <NavigationHeader
        title={'Connect ' + connectionInfo.label }
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
      />
      <Content contentContainerStyle={styles.contentContainer}>
        {showSuccess && (
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
            {lastSync ? (
              <Text>Last sync: {lastSync} ago</Text>
            ) : undefined}
            {nextSync ? (
              <Text>Next sync: {nextSync}</Text>
            ) : undefined}
            {syncError ? (
              <Text>Error message: {syncError}</Text>
            ) : undefined}
            <Text style={styles.disclaimer}>
              * During the developer preview, only the most recent 20 records
              are synchronized
            </Text>
          </View>
        )}
      </Content>
    </Container>
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
