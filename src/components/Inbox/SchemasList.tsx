import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import AccountManager from 'api/AccountManager'
import SocialSvg from 'assets/icons/data/social.svg'
import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'

export type SchemasListProps = Omit<ViewProps, 'children'> & {
  schemas: string[]
}

type RequestedData = {
  name: string
  icon: React.ReactNode
}

function SchemasList(props: SchemasListProps) {
  const { schemas } = props
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
            _dataList.push({
              name: schemaJson.titlePlural,
              icon: <SocialSvg />,
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

  return (
    <View style={styles.container}>
      {dataList.map((data, index) => (
        <TouchableOpacity style={styles.dataFolder} key={`folder-${index}`}>
          {data.icon}
          <Text style={styles.folderName}>{data.name}</Text>
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
})

export default SchemasList
