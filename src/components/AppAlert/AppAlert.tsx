import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import ErrorAlertIcon from 'assets/alert_error_icon.svg'
import InfoAlertIcon from 'assets/alert_info_icon.svg'
import WarningAlertIcon from 'assets/alert_warning_icon.svg'
import ChevronRightIcon from 'assets/icons/chevron_right_x24.svg'
import { NUNITO_SANS } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

type AlertType = 'info' | 'warning' | 'error'

type AppAlertProps = {
  type?: AlertType
  onPress?: () => void
  message: string
}

const displayAlertIcon = (alertType: AlertType): React.ReactElement => {
  switch (alertType) {
    case 'info':
      return <InfoAlertIcon />
    case 'warning':
      return <WarningAlertIcon />
    case 'error':
      return <ErrorAlertIcon />
    default:
      return <InfoAlertIcon />
  }
}

const AppAlert: React.FC<AppAlertProps> = ({
  message,
  type = 'info',
  onPress,
}) => {
  const styles = useThemeAwareStyle(createStyles)
  return (
    <View style={[styles.container, styles[type]]}>
      <View style={styles.alertContent}>
        <View style={styles.alertIcon}>{displayAlertIcon(type)}</View>
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
      {onPress && (
        <View style={styles.button}>
          <Pressable onPress={onPress}>
            <ChevronRightIcon />
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default AppAlert

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.color.backgroundGray,
      borderLeftWidth: 3,
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      borderRadius: theme.borderRadius.xs,
    },
    alertIcon: {
      marginVertical: 2,
    },
    alertContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexShrink: 1,
    },
    info: {
      borderLeftColor: theme.color.info,
    },
    warning: {
      borderLeftColor: theme.color.warning,
    },
    error: {
      borderLeftColor: theme.color.error,
    },
    alertMessage: {
      fontFamily: NUNITO_SANS,
      fontWeight: '600',
      fontSize: theme.fontSize.m,
      lineHeight: 20,
      paddingLeft: 8,
      flexShrink: 1,
    },
    button: {
      marginLeft: 8,
    },
  })
}
