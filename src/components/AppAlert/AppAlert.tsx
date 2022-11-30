import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import ErrorAlertIcon from 'assets/alert_error_icon.svg'
import InfoAlertIcon from 'assets/alert_info_icon.svg'
import WarningAlertIcon from 'assets/alert_warning_icon.svg'

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

const AppAlert: React.FC<AppAlertProps> = ({
  body = 'What are Verida Badges?',
  type = 'info',
  action,
}) => {
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

  return (
    <View style={[styles.container, styles[getAlertColor(type)]]}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        {DisplayAlertIcon(type)}
        <Text style={styles.alertText}>{body}</Text>
      </View>
      {!action && (
        <Pressable onPress={action}>
          <Text>i</Text>
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
    backgroundColor: '#ddd',
    borderLeftColor: 'yellow',
    borderLeftWidth: 3,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  info: {
    borderLeftColor: '#0073FF',
  },
  warning: {
    borderLeftColor: '#F8A934',
  },
  error: {
    borderLeftColor: '#FD4F64',
  },
  alertText: {
    color: 'black',
    textAlign: 'left',
    paddingHorizontal: 8,
  },
})
