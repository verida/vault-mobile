import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content, List } from 'native-base'

import DataList from '../../components/DataList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { getVault } from '../../api'
import { useNavigation } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'
import LottieView from 'lottie-react-native'

const Folders = () => {
  const navigationProp = useNavigation()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const vault = await getVault()
      const { navigation, folders } = vault.data.map

      const items = navigation.map((folder) => {
        if (!folders[folder]) {
          // folder doesn't exist
          console.error(
            `${folder} is listed in navigation, but not defined in map.json`
          )
          return
        }

        const { title, titlePlural, icon } = folders[folder]

        return {
          label: titlePlural || title,
          icon: icon,
          onPress: () => {
            navigationProp.navigate('DataFolder', { folderName: folder })
          },
        }
      })

      setList(items)
      setLoading(false)
    }

    init()
  }, [navigationProp])

  return (
    <Container>
      <NavigationHeader left={{ icon: 'skip' }} title='Data' />
      {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('assets/animations/loading.json')}
            autoPlay
            loop
            style={styles.loadingView}
          />
        </View>
      ) : (
        <Content>
          <List>
            <DataList list={list} />
          </List>
        </Content>
      )}
    </Container>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingView: {
    width: 200,
    height: 200,
  },
})

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Folders)
