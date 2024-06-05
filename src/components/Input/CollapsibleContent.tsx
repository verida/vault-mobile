import React, { useCallback, useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type CollapsibleContentProps = {
  title: string
  value?: string
  expandedByDefault?: boolean
} & ViewProps

export const CollapsibleContent: React.FunctionComponent<
  CollapsibleContentProps
> = (props) => {
  const { title, expandedByDefault, value, children, ...viewProps } = props

  const [isExpanded, setIsExpanded] = useState<boolean>(
    expandedByDefault ?? false
  )
  const styles = useThemeAwareStyle(createStyles)

  const handleToggleCollapse = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  return (
    <View {...viewProps}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={handleToggleCollapse} activeOpacity={0.8}>
          <View style={styles.collapsibleButtonContent}>
            {isExpanded ? (
              <>
                <Icon
                  name='chevron-up'
                  size={24}
                  style={styles.collapsibleButtonIcon}
                />
              </>
            ) : (
              <>
                {value ? <Text style={styles.value}>{value}</Text> : null}
                <Icon
                  name='chevron-down'
                  size={24}
                  style={styles.collapsibleButtonIcon}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
      {!isExpanded ? null : <View>{children}</View>}
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.l,
      lineHeight: 24,
      marginBottom: theme.spacing.m,
    },
    collapsibleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    collapsibleButtonIcon: {
      color: theme.color.iconDefault,
    },
    value: {
      color: theme.color.iconDefault,
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.m,
      lineHeight: 21,
      textTransform: 'capitalize',
      marginRight: theme.spacing.s,
    },
  })
