import { dataFolders } from 'features/data'
import { Logger } from 'features/telemetry'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'

import { DataList } from 'components/Data'
import LoadingView from 'components/LoadingView'
import { TabsScreenProps } from 'navigation/types'

const logger = Logger.create('Pages/Data/DataTabScreen')

export type DataScreenParams = undefined

type DataScreenProps = TabsScreenProps<'Data'>

export const DataScreen: React.FunctionComponent<DataScreenProps> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Data',
    })
  }, [navigation])

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const _items = dataFolders
          .filter((folderDefinition) => folderDefinition.root)
          .map((folderDefinition) => {
            const { name, title, titlePlural, icon } = folderDefinition

            return {
              label: titlePlural || title,
              icon: icon,
              onPress: () => {
                navigation.navigate('DataFolder', { folderName: name })
              },
            }
          })

        setItems(_items)
      } catch (error) {
        logger.error(
          new Error(`Failed to load the Data folders`, {
            cause: error,
          })
        )
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [navigation])

  return (
    <Container>
      {loading ? (
        <LoadingView />
      ) : (
        <Content>
          <DataList items={items} />
        </Content>
      )}
    </Container>
  )
}
