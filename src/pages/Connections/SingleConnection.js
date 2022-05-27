import { Container, Icon, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import Text from 'components/Text'
import { View, StyleSheet, Image } from 'react-native'
import DataConnectorsManager from 'api/DataConnectorsManager'

import { SUCCESS_COLOR } from 'constants/color'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Button from 'components/Button'

import { connectionsList } from './DataConnector'

export default ({ route, navigation }) => {
  const showSuccess =
    route.params && route.params.provider && route.params.accessToken

  useEffect(() => {
    if (showSuccess) {
      const { provider, ...others } = route.params
      DataConnectorsManager.authComplete(provider, others)
    }
  }, [route.params.accessToken])

  const item = connectionsList[route.params.provider]
  const { name } = item
  const [lastSync, setLastSync] = useState('9 hours ago')
  useEffect(() => {
    // const syncInfo = DataConnectorsManager.syncInfo(name)
    // if (syncInfo) {
    //   setLastSync(syncInfo.syncLast)
    // }
  }, [item])

  const onPressConnect = () => {
    DataConnectorsManager.initiateAuth(name)
  }
  const onPressSync = () => {
    DataConnectorsManager.sync(name)
  }
  const onPressDisconnect = () => {
    DataConnectorsManager.disconnect(name)
  }

  return (
    <Container>
      <NavigationHeader
        title={'Connect ' + item.label}
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
          <Image style={styles.itemIcon} source={item.icon} />
          <View style={styles.actionButtons}>
            {item.status === 'disabled' ? (
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
                  disabled={item.status === 'syncing'}>
                  Sync
                </Button>
              </>
            )}
          </View>
        </View>
        {item.status !== 'disabled' && (
          <View style={styles.infoText}>
            <Text>
              Status: {item.status} (Last sync: {lastSync})
            </Text>
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
