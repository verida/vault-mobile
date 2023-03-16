import { BlurView, BlurViewProps } from '@react-native-community/blur'
import React from 'react'
import { Platform, StyleSheet, TextProps, View, ViewProps } from 'react-native'

import { NUNITO_SANS_BOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import { Label } from './Typography/Label'

interface TagProps extends ViewProps {
  withBlur?: boolean
  blurProps: BlurViewProps
}

interface TagLabelProps extends TextProps {
  bold?: boolean
}

export function Tag(props: TagProps) {
  const { children, style, withBlur, blurProps, ...rest } = props
  const styles = useThemeAwareStyle(createStyles)
  return (
    <View style={[styles.container, style]} {...rest}>
      {withBlur &&
        Platform.OS === 'ios' && ( // Android blur doesn't work well, so disable it temporarily
          <BlurView style={styles.blurView} {...blurProps} />
        )}
      {children}
    </View>
  )
}

const TagLabel: React.FC<TagLabelProps> = ({
  children,
  bold,
  style,
  ...restProps
}) => {
  const styles = useThemeAwareStyle(createStyles)
  return (
    <Label
      style={[styles.label, bold ? styles.lableBold : {}, style]}
      {...restProps}>
      {children}
    </Label>
  )
}

Tag.Label = TagLabel

Tag.defaultProps = {
  withBlur: false,
  blurProps: {
    blurAmount: 2,
    blurType: 'light',
    reducedTransparencyFallbackColor: 'black',
  },
} as TagProps

TagLabel.defaultProps = {
  bold: false,
} as TagLabelProps

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.color.primary50,
      borderRadius: theme.roundness.xs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.s,
    },
    blurView: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.roundness.xs,
    },
    label: {
      fontFamily: NUNITO_SANS_BOLD,
      fontSize: theme.fontSize.xs,
      fontWeight: '400',
      lineHeight: 13,
    },
    lableBold: {
      fontWeight: '600',
    },
  })
