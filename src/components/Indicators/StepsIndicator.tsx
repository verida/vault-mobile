import Color from 'color'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { Theme } from '~/styles/types'

type Props = {
  currentStep: number
  numberOfSteps: number
} & ViewProps

export const StepsIndicator = ({
  currentStep,
  numberOfSteps,
  style,
  ...rest
}: Props) => {
  const styles = useThemeAwareStyle(createStyles)

  return (
    <View style={[styles.container, style]} {...rest}>
      {Array.from(Array(numberOfSteps))
        .fill(1)
        .map((_, index) => {
          return (
            <View
              key={index}
              style={[
                styles.stepLine,
                index <= currentStep ? styles.stepLineActive : {},
                {
                  marginRight:
                    numberOfSteps > 1 && index < numberOfSteps - 1 ? 4 : 0,
                },
              ]}
            />
          )
        })}
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: Color(theme.color.primary).alpha(0.2).toString(),
    },
    stepLineActive: {
      flex: 1,
      height: 2,
      backgroundColor: theme.color.primary,
    },
  })
