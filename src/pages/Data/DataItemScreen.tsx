import * as Sentry from '@sentry/react-native'
import { DataItem } from 'features/data'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'

import Folder from 'api/VaultCommon/managers/data/folder'
import { DataFieldList } from 'components/Data/DataFieldList'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'
import { CredentialDataItem } from 'pages/Data/CredentialDataItem'

export interface DataItemScreenParams {
  // TODO: Type the data item
  item: any
  folder: Folder
}

type DataItemScreenProps = MainStackScreenProps<'DataItem'>

export const DataItemScreen: React.FunctionComponent<DataItemScreenProps> = (
  props
) => {
  const { route } = props
  const { item, folder } = route.params

  const [data, setData] = useState<DataItem>({
    data: [],
    title: '',
  })
  const [loading, setLoading] = useState(true)

  const isCredential = folder.config.database === 'credential'

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const _data = isCredential
          ? await folder.getDetail(
              item.credentialData.credentialSubject || item.credentialData,
              item.credentialData.credentialSchema?.id || item.credentialSchema
            )
          : await folder.getDetail(item)
        setData(_data)
        setLoading(false)
      } catch (e) {
        setLoading(false)
        Alert.alert('Failed to fetch data')
        Sentry.captureException(e)
      }
    }

    init()
  }, [folder, item, isCredential])

  return (
    <Container>
      <NavigationHeader title={folder.config.title} />
      <Content contentContainerStyle={styles.content}>
        {loading ? (
          <LoadingView />
        ) : (
          <>
            {isCredential ? (
              <CredentialDataItem data={data} item={item} />
            ) : (
              <DataFieldList fields={data.data} />
            )}
          </>
        )}
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
})
