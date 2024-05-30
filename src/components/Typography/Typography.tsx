import React from 'react'
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native'

import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h5SemiBold'
  | 'button'
  | 'body'
  | 'bodySemiBold'
  | 'label'

export type TypographyProps = {
  variant?: TypographyVariant
  transform?: TextStyle['textTransform']
} & TextProps

/**
 * Typography component to be used for all text.
 *
 * All text should fall in a variant, keep these variants and Figma in sync. If a text in Figma is not using the typography variant, check with the designers.
 */
export const Typography: React.FunctionComponent<TypographyProps> = (props) => {
  const { children, variant = 'body', transform, style, ...textProps } = props

  const styles = useThemeAwareStyle(createStyles)

  const variantStyle = styles[variant]

  return (
    <Text
      style={[
        styles.common,
        variantStyle,
        {
          textTransform: transform,
        },
        style,
      ]}
      {...textProps}>
      {children}
    </Text>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    common: {
      color: theme.color.text,
    },
    // TODO: Could move the following variant style in the theme object if properly typed with TextStyle. On the other hand, defining them in this component kinda force to use this component
    h1: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.xxxxl,
      lineHeight: theme.fontSize.xxxxl * 1.3,
      letterSpacing: -0.41,
    },
    h2: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.s28,
      lineHeight: theme.fontSize.s28 * 1.3,
    },
    h3: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.xxl,
      lineHeight: theme.fontSize.xxl * 1.3,
    },
    h4: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.sl,
      lineHeight: theme.fontSize.sl * 1.3,
    },
    h5: {
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.5,
    },
    h5SemiBold: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.5,
    },
    button: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.375,
    },
    body: {
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.fontSize.m,
      lineHeight: theme.fontSize.m * 1.5,
    },
    bodySemiBold: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.m,
      lineHeight: theme.fontSize.m * 1.5,
    },
    label: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.s,
      lineHeight: theme.fontSize.s * 1.5,
    },
  })
