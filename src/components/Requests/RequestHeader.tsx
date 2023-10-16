import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

import AppLogo from 'components/AppLogo'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { Theme } from 'styles/types'

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

  const styles = useThemeAwareStyle(createStyles)

  const date = (
    <Text style={styles.date}>
      {(timestamp ? new Date(timestamp) : new Date()).toLocaleString()}
    </Text>
  )

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <AppLogo // TODO: Rework the avatar
          url={avatar || null}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{senderName}</Text>
          {onToggleDetails ? (
            <>
              <TouchableOpacity
                onPress={onToggleDetails}
                style={styles.detailsButton}>
                {date}
                <Feather
                  name={isDetailsOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  style={styles.detailsButtonIndicator}
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
      borderRadius: 999999,
      marginRight: theme.spacing.s,
    },
    name: {
      fontSize: 17,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_BOLD,
    },
    detailsButton: {
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
    },
    date: {
      fontSize: 12,
      lineHeight: 18,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      color: theme.color.textLightGrey,
    },
    detailsButtonIndicator: {
      marginLeft: theme.spacing.xs,
      color: theme.color.textLightGrey,
    },
  })
