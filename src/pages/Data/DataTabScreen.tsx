import { dataFolders } from 'features/data'
import { Logger } from 'features/telemetry'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'

import { DataList } from 'components/Data'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { TabsScreenProps } from 'navigation/types'

const logger = new Logger('Data Screen')

export type DataTabScreenParams = undefined

type DataTabScreenProps = TabsScreenProps<'Data'>

export const DataTabScreen: React.FunctionComponent<DataTabScreenProps> = (
  props
) => {
  const { navigation } = props

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
      } catch (error: unknown) {
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
      <NavigationHeader left={{ icon: 'skip' }} title='Data' />
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
