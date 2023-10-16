import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { Theme } from 'styles/types'

type RequestDetailProperty = {
  label: string
  value?: string
  // TODO: Add copy to clipboard as suggested per UX design
}

export type RequestDetailsProps = {
  properties: RequestDetailProperty[]
  // TODO: Add custom action with button as suggested per UX design
} & ViewProps

export const RequestDetails: React.FunctionComponent<RequestDetailsProps> = (
  props
) => {
  const { properties, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        {properties.length > 0 ? (
          properties.map((property) => (
            <View key={property.label}>
              <Text style={styles.propertyLabel}>{property.label}</Text>
              <Text style={styles.propertyValue}>{property.value || '-'}</Text>
            </View>
          ))
        ) : (
          <Text>No details available</Text>
        )}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: theme.color.lightGrey,
    },
    propertyLabel: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    propertyValue: {
      marginTop: theme.spacing.s,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
  })
