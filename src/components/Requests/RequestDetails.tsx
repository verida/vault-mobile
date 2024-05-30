import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { Typography } from '~/components'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type RequestDetailProperty = {
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
              <Typography
                variant='bodySemiBold'
                style={styles.propertyLabel}
                numberOfLines={1}
                ellipsizeMode='tail'>
                {property.label}
              </Typography>
              {!property.value ? (
                <Typography
                  variant='bodySemiBold'
                  numberOfLines={2}
                  ellipsizeMode='tail'>
                  {'-'}
                </Typography>
              ) : typeof property.value === 'string' ? (
                <Typography
                  variant='bodySemiBold'
                  numberOfLines={2}
                  ellipsizeMode='tail'>
                  {property.value}
                </Typography>
              ) : (
                <Typography
                  variant='bodySemiBold'
                  numberOfLines={2}
                  ellipsizeMode='tail'>
                  {property.value}
                </Typography>
              )}
            </View>
          ))
        ) : (
          <Typography>No details available</Typography>
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
      color: theme.color.textLightGrey,
      marginBottom: theme.spacing.s,
    },
  })
