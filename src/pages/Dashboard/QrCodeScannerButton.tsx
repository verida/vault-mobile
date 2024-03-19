import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import QrScannerIcon from 'assets/icons/qr_scanner.svg'
import { LIGHTGREY_COLOR, TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

type QrCodeScannerButtonProps = {
  onPress: () => void
}

export const QrCodeScannerButton: React.FunctionComponent<
  QrCodeScannerButtonProps
> = (props) => {
  const { onPress } = props

  const { theme } = useTheme()

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <QrScannerIcon fill={theme.color.iconDefault} />
      <Text style={styles.label}>Scan QR Code</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 13,
    backgroundColor: WHITE_COLOR,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
  },
  label: {
    fontSize: 16,
    lineHeight: 21.82,
    fontFamily: NUNITO_SANS_BOLD,
    marginLeft: 10,
    color: TEXT_COLOR,
  },
})
