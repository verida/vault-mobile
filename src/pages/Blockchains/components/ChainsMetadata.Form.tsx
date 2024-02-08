import { SupportedBlockchainNamespace } from 'features/blockchain'
import * as React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { $enum } from 'ts-enum-util'

import Label, { DEFAULT_LABEL_COLOR } from 'components/Label'
import DropDownPicker, { Option } from 'components/Select'
import { DECLINE_COLOR } from 'constants/color'
import InputStyles from 'styles/inputs'

import { useCreateChainMetadataFormFields } from '../hooks'

const NAMESPACE_DROPDOWN_OPTIONS: {
  readonly [key in SupportedBlockchainNamespace]: Omit<Option, 'value'>
} = {
  [SupportedBlockchainNamespace.EIP_155]: {
    label: 'EIP 155 (EVM)',
  },
  [SupportedBlockchainNamespace.NEAR]: {
    label: 'Near',
  },
}

const namespaceDropdownOptions: Option[] = Object.entries(
  NAMESPACE_DROPDOWN_OPTIONS
).map(([value, partialOption]): Option => ({ ...partialOption, value }))

const mainnetDropdownOptions: Option[] = [
  {
    label: 'Unknown',
    value: JSON.stringify(null),
  },
  {
    label: 'Mainnet',
    value: JSON.stringify(true),
  },
  {
    label: 'Testnet',
    value: JSON.stringify(false),
  },
]

export const ChainsMetadataForm = React.memo(function ChainsMetadataForm({
  name,
  setName,
  rpcUrl,
  setRpcUrl,
  namespace,
  setNamespace,
  reference,
  setReference,
  decimals,
  setDecimals,
  nativeCurrencyName,
  setNativeCurrencyName,
  symbol,
  setSymbol,
  icon,
  setIcon,
  blockExplorerUrl,
  setBlockExplorerUrl,
  isMainnet,
  setIsMainnet,
  disabled,
  evaluationResult: { error: maybeError },
}: ReturnType<typeof useCreateChainMetadataFormFields> & {
  readonly disabled: boolean
}): JSX.Element {
  const onChangeNamespaceDropdownOption = React.useCallback(
    ({ value }: Option) => {
      if (!$enum(SupportedBlockchainNamespace).isValue(value))
        throw new Error(`Expected valid value, encountered "${value}".`)

      setNamespace(value)
    },
    [setNamespace]
  )

  const onChangeMainnetDropdownOption = React.useCallback(
    ({ value }: Option) => {
      const result = JSON.parse(value)

      if (typeof result !== 'boolean' && result !== null)
        throw new Error(`Encountered invalid result, "${value}".`)

      setIsMainnet(result)
    },
    [setIsMainnet]
  )

  const getMaybeFieldError = React.useCallback(
    (fieldName: string) => {
      if (!maybeError || !('issues' in maybeError)) return null

      const { issues } = maybeError

      const maybeIssue = issues?.find((e) => e.path?.[0] === fieldName)

      if (!maybeIssue) return null

      return maybeIssue.message
    },
    [maybeError]
  )

  const computeLabelStyleForError = React.useCallback(
    (fieldName: string) =>
      getMaybeFieldError(fieldName)
        ? { color: DECLINE_COLOR }
        : { color: DEFAULT_LABEL_COLOR },
    [getMaybeFieldError]
  )

  return (
    <View style={styles.container}>
      <Label style={computeLabelStyleForError('namespace')}>
        Blockchain namespace
      </Label>
      <DropDownPicker
        disabled={disabled}
        showArrow
        defaultValue={namespace}
        placeholder='Select namespace'
        items={namespaceDropdownOptions}
        labelStyle={InputStyles.input_font}
        containerStyle={styles.select}
        onChangeItem={onChangeNamespaceDropdownOption}
      />
      <Label style={computeLabelStyleForError('name')}>Chain name</Label>
      <TextInput
        value={name}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={setName}
        style={InputStyles.input}
        placeholder={'Enter chain name'}
      />
      <Label style={computeLabelStyleForError('reference')}>Chain ID</Label>
      <TextInput
        value={reference}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        keyboardType='numeric'
        onChangeText={setReference}
        style={InputStyles.input}
        placeholder={'Enter Chain ID'}
      />
      <Label style={computeLabelStyleForError('isMainnet')}>Network type</Label>
      <DropDownPicker
        disabled={disabled}
        showArrow
        defaultValue={JSON.stringify(isMainnet)}
        placeholder='Select network type'
        items={mainnetDropdownOptions}
        labelStyle={InputStyles.input_font}
        containerStyle={styles.select}
        onChangeItem={onChangeMainnetDropdownOption}
      />
      <Label style={computeLabelStyleForError('decimals')}>Decimals</Label>
      <TextInput
        value={String(decimals)}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        keyboardType='numeric'
        onChangeText={(e) => setDecimals(parseInt(e, 10))}
        style={InputStyles.input}
        placeholder={'Enter decimals'}
      />
      <Label style={computeLabelStyleForError('rpcUrls')}>RPC URL</Label>
      <TextInput
        value={rpcUrl}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={setRpcUrl}
        style={InputStyles.input}
        placeholder={'Enter RPC URL'}
      />
      <Label style={computeLabelStyleForError('icon')}>
        Network icon URL (optional)
      </Label>
      <TextInput
        value={icon}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={setIcon}
        style={InputStyles.input}
        placeholder={'Enter Network icon URL'}
      />
      <Label style={computeLabelStyleForError('nativeCurrencyName')}>
        Network token name
      </Label>
      <TextInput
        value={nativeCurrencyName}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={setNativeCurrencyName}
        style={InputStyles.input}
        placeholder={'Set native token name'}
      />
      <Label style={computeLabelStyleForError('symbol')}>
        Network token symbol
      </Label>
      <TextInput
        value={symbol}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={setSymbol}
        style={InputStyles.input}
        placeholder={'Set native token symbol'}
      />
      <Label style={computeLabelStyleForError('blockExplorers')}>
        Block explorer URL (optional)
      </Label>
      <TextInput
        value={blockExplorerUrl}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={setBlockExplorerUrl}
        style={InputStyles.input}
        placeholder={'Set block explorer URL'}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  select: {
    height: 60,
    alignItems: 'flex-start',
  },
})
