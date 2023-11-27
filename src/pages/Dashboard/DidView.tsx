import Clipboard from '@react-native-community/clipboard'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Text from 'components/Text'
import { PRIMARY_COLOR, SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export type DidViewProps = Omit<ViewProps, 'children'> & {
  did: string
}

function DidView(props: DidViewProps) {
  const { did, ...rest } = props
  const [showCopied, setShowCopied] = useState(false)

  const onCopy = () => {
    Clipboard.setString(did)
    setShowCopied(true)
    setTimeout(() => {
      setShowCopied(false)
    }, 2000)
  }

  return (
    <View style={styles.container} {...rest}>
      <Text style={styles.label}>DID:</Text>
      <Text style={styles.value} numberOfLines={2}>
        {did}
      </Text>
      {showCopied ? (
        <Text style={styles.copied}>copied!</Text>
      ) : (
        <TouchableOpacity
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          onPress={onCopy}>
          <Ionicons name='copy-sharp' size={20} color='white' />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY_COLOR,
    // borderRadius: 4,
  },
  label: {
    color: 'white',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    marginRight: 5,
  },
  value: {
    color: 'white',
    flex: 1,
    marginRight: 10,
  },
  copied: {
    color: SUCCESS_COLOR,
  },
})

export default DidView
