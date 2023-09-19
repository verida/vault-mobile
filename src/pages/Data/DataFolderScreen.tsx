import { Logger } from 'features/telemetry'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'

import AccountManager from 'api/AccountManager'
import Folder from 'api/VaultCommon/managers/data/folder'
import { DataCardView, DataListView } from 'components/Data'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'

const logger = new Logger('Data Screen')

export interface DataFolderScreenParams {
  folderName: string
}

type DataItemScreenProps = MainStackScreenProps<'DataFolder'>

export const DataFolderScreen: React.FunctionComponent<DataItemScreenProps> = (
  props
) => {
  const { route } = props
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
      } catch (error: unknown) {
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

  return (
    <Container>
      <NavigationHeader
        title={folder ? folder.config.titlePlural || folder.config.title : ''}
      />
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
    </Container>
  )
}
