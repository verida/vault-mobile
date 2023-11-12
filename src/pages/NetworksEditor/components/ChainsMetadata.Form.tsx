import * as React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import Label from 'components/Label'
import InputStyles from 'styles/inputs'

import { useCreateChainMetadataFormFields } from '../hooks'

export const ChainsMetadataForm = React.memo(function ChainsMetadataForm({
  name,
  setName,
  disabled,
}: ReturnType<typeof useCreateChainMetadataFormFields> & {
  readonly disabled: boolean
}): JSX.Element {
  return (
    <View style={styles.container}>
      <Label>Chain name</Label>
      <TextInput
        value={name}
        autoFocus={true}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={setName}
        style={InputStyles.input}
        placeholder={'Enter chain name'}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
})
