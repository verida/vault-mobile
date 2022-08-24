import { SignClientTypes } from '@walletconnect/types'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { Spacer } from 'components/Spacer'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import iconStyle from 'styles/icon'

/**
 * Types
 */
interface IProps {
  metadata: SignClientTypes.Metadata
}

/**
 * Components
 */
export default function ProjectInfoCard({ metadata }: IProps) {
  const { icons, name, url } = metadata

  return (
    <View style={styles.container}>
      <Image
        style={iconStyle.large}
        source={{
          uri: icons[0],
        }}
      />
      <Spacer height={8} />
      <Text style={styles.title}>{name}</Text>
      <Spacer height={8} />
      <Text style={styles.url}>{url}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
  },
  permission: {
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
  },
  url: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})
