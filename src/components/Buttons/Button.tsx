import React from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { Typography } from '~/components/Typography'
import { DISABLED_COLOR, HIT_SLOP_10_10 } from '~/constants'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

// TODO: Consider a type prop to handle the diversity of buttons, see Figma
// export type ButtonType = 'contained' | 'outlined'
// TODO: Add an icon prop
// TODO: Add a loading prop

export type ButtonProps = {
  variant?: ButtonVariant
} & TouchableOpacityProps

export const Button: React.FC<ButtonProps> = (props) => {
  const { variant = 'primary', disabled, children, ...touchableProps } = props

  const styles = useThemeAwareStyle(createStyles)

  // TODO: Find a better way to define the varian style and apply it to the container and content

  const variantLabelStyle =
    variant === 'danger'
      ? disabled
        ? styles.variantDangerLabelDisabled
        : styles.variantDangerLabel
      : variant === 'secondary'
        ? disabled
          ? styles.variantSecondaryLabelDisabled
          : styles.variantSecondaryLabel
        : disabled
          ? styles.variantPrimaryLabelDisabled
          : styles.variantPrimaryLabel

  const content =
    typeof children === 'string' ? (
      <Typography variant='button' style={variantLabelStyle}>
        {children}
      </Typography>
    ) : (
      children
    )

  const variantContainerStyle =
    variant === 'danger'
      ? disabled
        ? styles.variantDangerContainerDisabled
        : styles.variantDangerContainer
      : variant === 'secondary'
        ? disabled
          ? styles.variantSecondaryContainerDisabled
          : styles.variantSecondaryContainer
        : disabled
          ? styles.variantPrimaryContainerDisabled
          : styles.variantPrimaryContainer

  return (
    <TouchableOpacity
      disabled={disabled}
      hitSlop={HIT_SLOP_10_10}
      {...touchableProps}>
      <View style={[styles.container, variantContainerStyle]}>{content}</View>
    </TouchableOpacity>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      padding: theme.spacing.sm,
      borderRadius: theme.roundness.xs,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    variantPrimaryContainer: {
      backgroundColor: theme.color.primary,
      borderColor: theme.color.primary,
    },
    variantPrimaryContainerDisabled: {
      opacity: 0.5,
      backgroundColor: DISABLED_COLOR,
      borderColor: DISABLED_COLOR,
    },
    variantPrimaryLabel: {
      color: theme.color.onPrimary,
    },
    variantPrimaryLabelDisabled: {
      color: theme.color.onPrimary,
    },
    variantSecondaryContainer: {
      backgroundColor: theme.color.background,
      borderColor: theme.color.lightGrey,
    },
    variantSecondaryContainerDisabled: {
      opacity: 0.5,
      backgroundColor: theme.color.background,
      borderColor: DISABLED_COLOR,
    },
    variantSecondaryLabel: {
      color: theme.color.onBackground,
    },
    variantSecondaryLabelDisabled: {
      color: theme.color.onBackground,
    },
    variantDangerContainer: {
      backgroundColor: theme.color.orange,
      borderColor: theme.color.orange,
    },
    variantDangerContainerDisabled: {
      opacity: 0.5,
      backgroundColor: theme.color.orange,
      borderColor: theme.color.orange,
    },
    variantDangerLabel: {
      color: theme.color.onPrimary,
    },
    variantDangerLabelDisabled: {
      color: theme.color.onPrimary,
    },
  })
