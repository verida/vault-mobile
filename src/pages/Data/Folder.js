import * as Sentry from '@sentry/react-native'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import AccountManager from 'api/AccountManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import {
  StyleSheet,
  View,
} from 'react-native'
import LoadingView from 'components/LoadingView'
import DataCardView from 'components/Data/CardView'
import DataListView from 'components/Data/ListView'

const Folder = (props) => {
  const { route } = props
  const [folder, setFolder] = useState()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        setLoaded(false)
        const { folderName } = route.params
        const vault = AccountManager.getInstance().vault
        const _folder = await vault.data.selectFolder(folderName)
        setLoaded(true)
        setFolder(_folder)
      } catch (e) {
        setLoaded(true)
        Sentry.captureException(e)
      }
    }

    init()
  }, [route.params])

  return (
    <Container>
      <NavigationHeader
        title={folder ? folder.config.titlePlural || folder.config.title : ''}
      />
      {
        !loaded ? 
        <View style={styles.loadingContainer}>
          <LoadingView />
        </View>
        :
        folder ?
          <Content>
            {folder.config.display === 'folders'
              ? React.createElement(DataCardView, { folder })
              : React.createElement(DataListView, { folder })}
          </Content>
          :
          null
      }
    </Container>
  )
}

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Folder)

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
