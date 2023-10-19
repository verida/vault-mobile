import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { Theme } from 'styles/types'

type RequestDetailProperty = {
  label: string
  value?: string | React.ReactNode
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
            <View key={property.label} style={styles.propertyWrapper}>
              <Text
                style={styles.propertyLabel}
                numberOfLines={1}
                ellipsizeMode='tail'>
                {property.label}
              </Text>
              {!property.value ? (
                <Text
                  style={styles.propertyValue}
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {'-'}
                </Text>
              ) : typeof property.value === 'string' ? (
                <Text
                  style={styles.propertyValue}
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {property.value}
                </Text>
              ) : (
                <Text
                  style={styles.propertyValue}
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {property.value}
                </Text>
              )}
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
      paddingVertical: 0,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: theme.color.lightGrey,
    },
    propertyWrapper: {
      flex: 1,
      marginVertical: theme.spacing.sm,
    },
    propertyLabel: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
      marginBottom: theme.spacing.s,
    },
    propertyValue: {
      fontSize: 14,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
  })
