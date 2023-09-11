import * as Sentry from '@sentry/react-native'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import Folder from 'api/VaultCommon/managers/data/folder'
import { DataCardView, DataListView } from 'components/Data'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'

export interface DataFolderScreenParams {
  folderName: string
}

type DataItemScreenProps = MainStackScreenProps<'DataFolder'>

export const DataFolderScreen: React.FunctionComponent<DataItemScreenProps> = (
  props
) => {
  const { route } = props

  const [folder, setFolder] = useState<Folder>()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        setLoaded(false)
        const { folderName } = route.params
        const vault = AccountManager.getInstance().vault
        const _folder = await vault!.data.selectFolder(folderName)
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
      {!loaded ? (
        <View style={styles.loadingContainer}>
          <LoadingView />
        </View>
      ) : folder ? (
        <Content>
          {folder.config.display === 'folders' ? (
            <DataCardView folder={folder} />
          ) : (
            <DataListView folder={folder} />
          )}
        </Content>
      ) : null}
    </Container>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
