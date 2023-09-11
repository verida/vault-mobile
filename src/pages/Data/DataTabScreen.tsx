import { Container, Content, List } from 'native-base'
import React, { useEffect, useState } from 'react'

import AccountManager from 'api/AccountManager'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { TabsScreenProps } from 'navigation/types'

import DataList from '../../components/DataList'

export type DataTabScreenParams = undefined

type DataTabScreenProps = TabsScreenProps<'Data'>

export const DataTabScreen: React.FunctionComponent<DataTabScreenProps> = (
  props
) => {
  const { navigation } = props

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const vault = AccountManager.getInstance().vault
      // TODO: Remove the ! once the whole thing is refactored
      const { navigation: navigationFolders, folders } = vault!.data.map

      const items = navigationFolders.map((folder: string) => {
        if (!folders[folder]) {
          // folder doesn't exist
          return
        }

        const { title, titlePlural, icon } = folders[folder]

        return {
          label: titlePlural || title,
          icon: icon,
          onPress: () => {
            navigation.navigate('DataFolder', { folderName: folder })
          },
        }
      })

      setList(items)
      setLoading(false)
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
          <List>
            <DataList list={list} />
          </List>
        </Content>
      )}
    </Container>
  )
}
