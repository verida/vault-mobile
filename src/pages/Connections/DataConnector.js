import { Container, Icon, Content } from 'native-base'
import React, { useState, useEffect } from 'react'
import Text from 'components/Text'
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native'
import DataConnectorsManager from 'api/DataConnectorsManager'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

function buildConnections(allConnectors: any) {
  const finalConnectors = []
  for (let connectorName in allConnectors) {
    finalConnectors.push(allConnectors[connectorName].render())
  }

  return finalConnectors
}

export default (props) => {
  const [linkParams] = useState(props.route.params)
  const showSuccess = linkParams && linkParams.provider && linkParams.accessToken

  const [connectors, setConnectors] = useState([])
  let allConnectors = []

  useEffect(() => {
    const load = async () => {
      DataConnectorsManager.triggerSync()

      if (showSuccess) {
        const { provider, ...others } = linkParams
        await DataConnectorsManager.authComplete(provider, others)
      }

      allConnectors = await DataConnectorsManager.getConnectors()
      setConnectors(buildConnections(allConnectors))

      DataConnectorsManager.on("connectionUpdated", (conn: any) => {
        // Connection has been updated, so update UI
        allConnectors[conn.name] = conn
        setConnectors(buildConnections(allConnectors))
      })
    }

    load()
  }, [showSuccess])

  return (
    <Container>
      <NavigationHeader
        title='Connections'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
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
        <FlatList
          data={connectors}
          style={styles.connectionList}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('SingleConnection', { item })
                }}
                style={styles.connectionItem}>
                <View style={styles.connectionItemIconLabel}>
                  <Image style={styles.itemIcon} source={item.icon} />
                  <Text style={styles.itemText}>{item.label}</Text>
                </View>
                <Text style={styles.itemStatusText}>{item.syncStatus}</Text>
              </TouchableOpacity>
            )
          }}
        />
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
    marginTop: 10,
  },
  successMessageIcon: { color: '#fff', marginRight: 10 },
  successMessageText: { color: '#FFF', flex: 1 },
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
  itemIcon: { width: 48, height: 48, marginRight: 10 },
  itemText: {
    fontSize: 18,
  },
  itemStatusText: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontFamily: NUNITO_SANS_BOLD,
  },
})
