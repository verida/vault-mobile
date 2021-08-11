import React from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../../components/Text'
import Moment from 'moment'
import {
  BLACK_COLOR_OPACITY,
  LIGHTGREY_COLOR,
  WHITE_COLOR,
} from '../../constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

import VeridaLogo from '../../assets/icons/verida.svg'

// On press disabled for now
//const onPress = (props) => Actions[LOGIN_REQUEST](props);
//<TouchableOpacity style={style.card} onPress={() => onPress({ verified: false })}>

export default ({ data }) => {
  const expiry = data.expiry
  const now = Math.floor(Date.now() / 1000)
  const ageSeconds = expiry - now
  const age = Moment.duration(ageSeconds, 'seconds')
  return (
    <TouchableOpacity style={style.card}>
      <View style={style.details}>
        <VeridaLogo style={style.logo} />
        <View style={style.description}>
          <Text style={style.title}>{data.context}</Text>
          <Text style={style.text}>{age.humanize()} ago</Text>
        </View>
        <View style={style.time}>
          <Text style={[style.text, style.time]}>
            {Moment(data.insertedAt).format('MMM DD')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
  card: {
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: LIGHTGREY_COLOR,
    padding: 16,
    width: Dimensions.get('window').width - 40,
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  details: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  description: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
  },
  text: {
    fontSize: 13,
    flexWrap: 'wrap',
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  time: {
    textAlign: 'right',
    color: BLACK_COLOR_OPACITY(0.6),
  },
})
