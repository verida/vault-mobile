import React from 'react'
import { Linking, StyleSheet, View, ViewProps } from 'react-native'

import Button from '~/components/Button'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD } from '~/constants/text'

export type RequestedDataSelectorProps = Omit<ViewProps, 'children'> & {
  name: string
  schemaUrl: string
  userSelect: boolean
  onPress: (url: string) => void
  fallbackAction?: { label: string; url: string }
  selectedItems?: any[]
}

// Note: Previous component was 'components/Inbox/SchemasList'. It used to fetch the requested schema to get its label, icon and description. Depending on the design, it might be need again but for now, in this component, we use the message from the requestor to display the requested data.

export function RequestedDataSelector(props: RequestedDataSelectorProps) {
  const {
    name,
    schemaUrl,
    userSelect,
    onPress,
    fallbackAction,
    selectedItems,
    ...viewProps
  } = props

  const selectionDetailsText = selectedItems?.length
    ? `${selectedItems.length} ${
        selectedItems.length > 1 ? 'items' : 'item'
      } selected`
    : 'No selection yet'

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <View>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.selectionDetails}>{selectionDetailsText}</Text>
        </View>
        <View>
          <Button
            style={styles.selectionButton}
            color={selectedItems?.length ? 'grey' : 'primary'}
            onPress={() => onPress(schemaUrl)}
            disabled={!userSelect}>
            Select existing
          </Button>
        </View>
        {fallbackAction ? (
          <View style={styles.fallbackActionContainer}>
            <Text>{`If you don't have the requested data`}</Text>
            <Button
              style={styles.fallbackActionButton}
              color='grey'
              onPress={() => Linking.openURL(fallbackAction.url)}>
              {fallbackAction.label}
            </Button>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  headerContainer: {},
  headerName: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
  },
  selectionDetails: {
    marginTop: 16,
  },
  selectionButton: {
    marginTop: 16,
  },
  fallbackActionContainer: {
    marginTop: 16,
  },
  fallbackActionButton: {
    marginTop: 16,
  },
})
