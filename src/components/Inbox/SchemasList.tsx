import React, { useEffect, useState } from 'react'
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'

import AccountManager from '~/api/AccountManager'
import LoadingView from '~/components/LoadingView'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD } from '~/constants/text'
import { Logger } from '~/features/telemetry'

const logger = Logger.create('Components/Data/SchemasList')

export type SchemasListProps = Omit<ViewProps, 'children'> & {
  schemas: string[]
  onItemPress: (url: string) => void
  userSelect: boolean
}

type RequestedData = {
  name: string
  icon: string
  description: string
  url: string
}

// TODO: Not used, to be removed eventually. Kept for RequestedDataSelector when need to implement the display of the schema icon, name and description.

function SchemasList(props: SchemasListProps) {
  const { schemas, onItemPress, userSelect } = props
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState<RequestedData[]>([])

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const _dataList: RequestedData[] = []
        await Promise.all(
          schemas.map(async (schemaUrl) => {
            const schema =
              await AccountManager.getInstance().client?.getSchema(schemaUrl)
            const schemaJson = (await schema?.getSchemaJson()) as any
            if (!schemaJson) {
              return
            }
            const appearance = await schema?.getAppearance()
            _dataList.push({
              name: schemaJson.titlePlural,
              icon: appearance.style.icon,
              description: schemaJson.description,
              url: schemaJson.$id,
            })
          })
        )
        setDataList(_dataList)
        setLoading(false)
      } catch (error) {
        logger.error(error)
        setLoading(false)
      }
    }

    init()
  }, [schemas])

  if (loading) {
    return <LoadingView type={'small'} />
  }

  return (
    <View style={styles.container}>
      {dataList.map((data, index) => (
        <TouchableOpacity
          style={styles.dataFolder}
          key={`folder-${index}`}
          onPress={() => onItemPress(data.url)}
          disabled={!userSelect}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image
                style={styles.schemaLogo}
                source={
                  data.icon ? { uri: data.icon } : require('assets/picture.png')
                }
              />
              <Text style={styles.folderName}>{data.name}</Text>
            </View>
            <Text style={styles.note} numberOfLines={2}>
              {data.description}
            </Text>
          </View>
          {userSelect && (
            <Entypo
              name='chevron-right'
              size={20}
              color={'rgba(4, 17, 51, 0.5)'}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  dataFolder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderName: {
    marginLeft: 15,
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    color: '#041133',
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  schemaLogo: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    borderRadius: 20,
  },
})

export default SchemasList
