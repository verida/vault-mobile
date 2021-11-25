import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import AccountManager from 'api/AccountManager'
import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import Entypo from 'react-native-vector-icons/Entypo'
import { SvgCssUri } from 'react-native-svg'

export type SchemasListProps = Omit<ViewProps, 'children'> & {
  schemas: string[]
  onItemPress: () => void
}

type RequestedData = {
  name: string
  icon: string
  description: string
}

class SvgUri extends React.Component<{
  height: string
  width: string
  uri: string
}> {
  render() {
    return null
  }
}

function SchemasList(props: SchemasListProps) {
  const { schemas, onItemPress } = props
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState<RequestedData[]>([])

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const _dataList: RequestedData[] = []
        await Promise.all(
          schemas.map(async (schemaUrl) => {
            const schema = await AccountManager.getInstance().client?.getSchema(
              schemaUrl
            )
            const schemaJson = await schema?.getSchemaJson()
            if (!schemaJson) {
              return
            }
            console.log(schemaJson)
            const appearance = await schema?.getAppearance()
            _dataList.push({
              name: schemaJson.titlePlural,
              icon: appearance.style.icon,
              description: schemaJson.description,
            })
          })
        )
        setDataList(_dataList)
        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }

    init()
  }, [schemas])

  if (loading) {
    return <LoadingView type={'small'} />
  }

  console.log('data.icon', dataList)

  return (
    <View style={styles.container}>
      {dataList.map((data, index) => (
        <TouchableOpacity
          style={styles.dataFolder}
          key={`folder-${index}`}
          onPress={onItemPress}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.icon}>
                <SvgCssUri width='100%' height='100%' uri={data.icon} />
              </View>
              <Text style={styles.folderName}>{data.name}</Text>
            </View>
            <Text style={styles.note} numberOfLines={2}>
              {data.description}
            </Text>
          </View>
          <Entypo
            name='chevron-right'
            size={20}
            color={'rgba(4, 17, 51, 0.5)'}
          />
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
  icon: {
    width: 40,
    height: 40,
  },
})

export default SchemasList
