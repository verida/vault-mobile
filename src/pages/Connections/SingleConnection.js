import { Container, Icon, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import Text from 'components/Text'
import { View, StyleSheet, Image } from 'react-native'
import DataConnectorsManager from 'api/DataConnectorsManager'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Button from 'components/Button'

export default ({ route, navigation }) => {
  const connectionItem = route.params.item
  const [syncStatus, setsyncStatus] = useState(connectionItem.syncStatus)
  const [connection, setConnection] = useState(connectionItem)
  useEffect(() => {
    const load = async () => {
      // upgrade our connection object to be a real connection instance from
      // the DataConnectorsManager so we can call sync() etc.
      const connectionInstance = await DataConnectorsManager.getConnection(connectionItem.name)
      setConnection(connectionInstance)
      setsyncStatus(connectionInstance.syncStatus)
    }
    load()

    DataConnectorsManager.on("connectionUpdated", (conn: any) => {
      setConnection(conn)
      setsyncStatus(conn.syncStatus)
    })
  })

  const onPressConnect = () => {
    connection.initiateAuth()
  }
  const onPressSync = () => {
    connection.sync()
  }
  const onPressDisconnect = () => {
    connection.disconnect()
  }

  return (
    <Container>
      <NavigationHeader
        title={'Connect ' + connection.label }
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
      />
      <Content contentContainerStyle={styles.contentContainer}>
        <View style={styles.connectHeader}>
          <Image style={styles.itemIcon} source={connection.icon} />
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
                  disabled={connection.syncStatus === 'syncing'}>
                  Sync
                </Button>
              </>
            )}
          </View>
        </View>
        {connection.syncStatus !== 'disabled' && (
          <View style={styles.infoText}>
            <Text>Status: {connection.syncStatus}</Text>
            {connection.syncLast ? (
              <Text>Last sync: {connection.syncLast}</Text>
            ) : undefined}
            <Text style={styles.disclaimer}>
              * During the developer preview, only the most recent 100 records
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
