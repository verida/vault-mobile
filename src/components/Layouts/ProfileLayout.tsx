import React from 'react'
import { StyleSheet, View } from 'react-native'

import ProfileImageLoader from '../../components/ProfileImageLoader'
import PropertyList from '../../components/PropertyList'
import { BLACK_COLOR_OPACITY } from '../../constants/color'
import { NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import LayoutStyle from '../../styles/layouts'
import Text from '../Text'
import Layout from './Layout'

interface profileLayoutProps {
  list: any
  publicProfile: any
  description: string
  userInfo: string
}

/**
 * @deprecated unused, will be removed
 */
export default function ProfileLayout(props: profileLayoutProps) {
  return (
    <Layout style={LayoutStyle.layout}>
      <ProfileImageLoader />
      {props.userInfo}
      <View>
        <PropertyList list={props.list} />
      </View>
      <Text style={style.description}>{props.description}</Text>
    </Layout>
  )
}

const style = StyleSheet.create({
  description: {
    textAlign: 'center',
    marginVertical: 17,
    color: BLACK_COLOR_OPACITY(0.4),
    fontSize: 12,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})
