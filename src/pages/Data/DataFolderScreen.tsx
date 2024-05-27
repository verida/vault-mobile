import { Logger } from 'features/telemetry'
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'

import { ScreenWrapper } from '~/components'

import AccountManager from 'api/AccountManager'
import Folder from 'api/VaultCommon/managers/data/folder'
import { DataCardView, DataListView } from 'components/Data'
import LoadingView from 'components/LoadingView'
import { MainStackScreenProps } from 'navigation/types'

const logger = Logger.create('Pages/Data/DataFolderScreen')

export interface DataFolderScreenParams {
  folderName: string
}

type DataItemScreenProps = MainStackScreenProps<'DataFolder'>

export const DataFolderScreen: React.FunctionComponent<DataItemScreenProps> = (
  props
) => {
  const { navigation, route } = props
  const { folderName } = route.params

  const [folder, setFolder] = useState<Folder>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const vault = AccountManager.getInstance().vault
        // TODO: Refactor the whole Vault, DataManager, etc.
        const _folder = await vault!.data.selectFolder(folderName)
        setFolder(_folder)
      } catch (error) {
        logger.error(
          new Error(`Failed to load the selected Data folder`, {
            cause: error,
          }),
          {
            extra: {
              folderName,
            },
          }
        )
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [folderName])

  useEffect(() => {
    navigation.setOptions({
      title: folder ? folder.config.titlePlural || folder.config.title : '',
    })
  }, [navigation, folder])

  return (
    <ScreenWrapper>
      {loading ? (
        <LoadingView />
      ) : folder ? (
        <Content>
          {folder.config.display === 'folders' ? (
            <DataCardView folder={folder} />
          ) : (
            <DataListView folder={folder} />
          )}
        </Content>
      ) : null}
    </ScreenWrapper>
  )
}
