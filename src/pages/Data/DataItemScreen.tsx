import { DataItem } from 'features/data'
import { Logger } from 'features/telemetry'
import { isCredentialsDatabase } from 'features/verifiableCredential'
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'

import { ScreenWrapper } from '~/components'

import Folder from 'api/VaultCommon/managers/data/folder'
import { CredentialDataItem, DataFieldList } from 'components/Data'
import LoadingView from 'components/LoadingView'
import { MainStackScreenProps } from 'navigation/types'

const logger = Logger.create('Pages/Data/DataItemScreen')

export interface DataItemScreenParams {
  // TODO: Type the data item
  item: any
  // TODO: Avoid passing a whole folder object that cannot be serialised in navigation params
  folder: Folder
}

type DataItemScreenProps = MainStackScreenProps<'DataItem'>

export const DataItemScreen: React.FunctionComponent<DataItemScreenProps> = (
  props
) => {
  const { navigation, route } = props
  const { item, folder } = route.params

  useEffect(() => {
    navigation.setOptions({
      title: folder.config.title,
    })
  }, [navigation, folder])

  const [data, setData] = useState<DataItem>({
    data: [],
    title: '',
  })
  const [loading, setLoading] = useState(false)

  const isCredential = isCredentialsDatabase(folder)

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
      } catch (error) {
        logger.error(
          new Error('Failed to load the Data item', { cause: error })
        )
        Alert.alert('Failed to load the data item')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [folder, item, isCredential])

  return (
    <ScreenWrapper>
      {loading ? (
        <LoadingView />
      ) : (
        <Content>
          {isCredential ? (
            <CredentialDataItem data={data} item={item} />
          ) : (
            <DataFieldList fields={data.data} />
          )}
        </Content>
      )}
    </ScreenWrapper>
  )
}
