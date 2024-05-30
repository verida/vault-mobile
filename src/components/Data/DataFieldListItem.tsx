import { Body, Card, CardItem, Text } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'

import { DataField } from '~/features/data'

export type DataFieldListItemProps = {
  field: DataField
}

export const DataFieldListItem: React.FunctionComponent<
  DataFieldListItemProps
> = (props) => {
  const { field } = props

  return (
    <Card transparent style={style.card}>
      <CardItem>
        <Body>
          <Text note>{field.field}</Text>
          <Text style={style.value}>
            {field.value === undefined ? '-' : String(field.value)}
          </Text>
        </Body>
      </CardItem>
    </Card>
  )
}

const style = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  value: {
    fontSize: 14,
    marginTop: 5,
  },
})
