import Text from 'components/Text'
import React from 'react'
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import { SUCCESS_COLOR } from 'constants/color'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { countries } from 'countries-list'
import { get } from 'lodash'
import VeridaSvg from 'assets/icons/verida.svg'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { NetworkNode } from 'api/types'

type NodeItemProps = Omit<TouchableOpacityProps, 'children'> & {
  data: NetworkNode
  selected: boolean
}

function NodeItem(props: NodeItemProps) {
  const { data, selected, ...rest } = props
  const countryName = get<string>(countries, `${data.ISO2_CC}.name`)

  return (
    <TouchableOpacity style={styles.container} {...rest}>
      {data.icon ? <Image source={{ uri: data.icon }} /> : <VeridaSvg />}
      <View style={styles.info}>
        <Text style={styles.name}>{data.name}</Text>
        {countryName && <Text style={styles.country}>{countryName}</Text>}
      </View>
      {selected && (
        <AntDesign name='checkcircle' size={20} color={SUCCESS_COLOR} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontFamily: NUNITO_SANS_BOLD,
    marginBottom: 4,
  },
  country: {
    fontSize: 14,
    color: '#041133',
  },
})

export default NodeItem
