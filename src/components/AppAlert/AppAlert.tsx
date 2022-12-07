import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import ErrorAlertIcon from 'assets/alert_error_icon.svg'
import InfoAlertIcon from 'assets/alert_info_icon.svg'
import WarningAlertIcon from 'assets/alert_warning_icon.svg'
import ChevronRightIcon from 'assets/icons/chevron_right_x24.svg'
import {
  ALERT_INFO_COLOR,
  ALERT_WARNING_COLOR,
  BACKGROUND_GREY_COLOR,
  DECLINE_COLOR,
} from 'constants/color'
import { NUNITO_SANS } from 'constants/text'

type AlertType = 'info' | 'warning' | 'error'

type AppAlertProps = {
  type: AlertType
  action?: () => void
  body: string
}

const getAlertColor = (type: AlertType): AlertType => {
  switch (type) {
    case 'info':
      return 'info'
    case 'warning':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'info'
  }
}

const DisplayAlertIcon = (iconType: AlertType): React.ReactElement => {
  switch (iconType) {
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

const AppAlert: React.FC<AppAlertProps> = ({ body, type, action }) => {
  return (
    <View style={[styles.container, styles[getAlertColor(type)]]}>
      <View style={styles.alertContent}>
        {DisplayAlertIcon(type)}
        <Text style={styles.alertText}>{body}</Text>
      </View>
      {action && (
        <Pressable onPress={action}>
          <ChevronRightIcon />
        </Pressable>
      )}
    </View>
  )
}

export default AppAlert

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BACKGROUND_GREY_COLOR,
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  alertContent: { flexDirection: 'row' },
  info: {
    borderLeftColor: ALERT_INFO_COLOR,
  },
  warning: {
    borderLeftColor: ALERT_WARNING_COLOR,
  },
  error: {
    borderLeftColor: DECLINE_COLOR,
  },
  alertText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1,
    paddingHorizontal: 10,
  },
})
