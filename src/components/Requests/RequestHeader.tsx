import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'

import { Avatar, Icon, Typography } from '~/components'
import { useTheme } from '~/contexts'
import { Theme } from '~/styles/types'

const SENDER_NAME_FALLBACK = 'Unknown'

export type RequestHeaderProps = {
  timestamp?: string
  senderName?: string
  avatar?: string
  isDetailsOpen?: boolean
  onToggleDetails?: () => void
} & ViewProps

export const RequestHeader: React.FunctionComponent<RequestHeaderProps> = (
  props
) => {
  const {
    senderName = SENDER_NAME_FALLBACK,
    avatar,
    timestamp,
    onToggleDetails,
    isDetailsOpen,
    ...viewProps
  } = props

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  const date = (
    <Typography variant='label' style={styles.date}>
      {(timestamp ? new Date(timestamp) : new Date()).toLocaleString()}
    </Typography>
  )

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <Avatar source={avatar} fallbackType='person' style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Typography variant='h4' ellipsizeMode='middle' numberOfLines={1}>
            {senderName}
          </Typography>
          {onToggleDetails ? (
            <>
              <TouchableOpacity
                onPress={onToggleDetails}
                style={styles.detailsButton}>
                {date}
                <Icon
                  name={isDetailsOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.color.textLightGrey}
                />
              </TouchableOpacity>
            </>
          ) : (
            <>{date}</>
          )}
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    avatar: {
      width: 48,
      aspectRatio: 1 / 1,
      borderRadius: theme.roundness.full,
      marginRight: theme.spacing.s,
    },
    detailsButton: {
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    date: {
      color: theme.color.textLightGrey,
    },
  })
