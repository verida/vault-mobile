import { Container, Content, Icon } from 'native-base'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import DataConnectorsManager from 'api/DataConnectorsManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { Logger } from 'features/telemetry'
import LoadingView from 'components/LoadingView'
import FastImage from 'react-native-fast-image'

const logger = new Logger('ConnectionsScreen')

function buildConnections(allConnectors) {
  const finalConnectors = []
  for (let connectorName in allConnectors) {
    finalConnectors.push(allConnectors[connectorName].render())
  }

  return finalConnectors
}

export const ConnectionsScreen = (props) => {
  const [connectors, setConnectors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        DataConnectorsManager.triggerSync()

        const currentConnectors = await DataConnectorsManager.getConnectors()
        setConnectors(buildConnections(currentConnectors))

        DataConnectorsManager.on('connectionUpdated', async () => {
          // Connection has been updated, so update UI
          const conns = await DataConnectorsManager.getConnectors()
          setConnectors(buildConnections(conns))
        })

        DataConnectorsManager.on('logout', async () => {
          await DataConnectorsManager.resetConnector()
        })
      } catch (error) {
        logger.error(new Error('Failed to load connections', {
          cause: error,
        }))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <Container>
      <NavigationHeader
        title='Connections'
        left={{icon: 'skip'}}
      />
      {loading ? <LoadingView /> :
        <Content contentContainerStyle={styles.contentContainer}>
          <FlatList
            data={connectors}
            style={styles.connectionList}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate('SingleConnection', {
                      provider: item,
                    })
                  }}
                  style={styles.connectionItem}>
                  <View style={styles.connectionItemIconLabel}>
                    <FastImage style={styles.itemIcon} source={{ uri: item.icon }} />
                    <Text style={styles.itemText}>{item.label}</Text>
                  </View>
                  <Text style={styles.itemStatusText}>{item.syncStatus}</Text>
                </TouchableOpacity>
              )
            }}
          />
        </Content>
      }
    </Container>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  connectionList: { marginTop: 20 },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  connectionItemIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  itemText: {
    fontSize: 18,
  },
  itemStatusText: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontFamily: NUNITO_SANS_BOLD,
  },
})
