import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import QrScannerIcon from 'assets/icons/qr_scanner.svg'
import { LIGHTGREY_COLOR, TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

interface QRCodeScannerSectionProps {
  onScanQRPress: () => void
}

const QRCodeScannerSection = ({ onScanQRPress }: QRCodeScannerSectionProps) => {
  return (
    <Pressable style={styles.container} onPress={onScanQRPress}>
      <View style={styles.cardDetails}>
        <QrScannerIcon />
        <Text style={styles.cardTitle}>Scan QR</Text>
      </View>
    </Pressable>
  )
}

export default QRCodeScannerSection

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    width: '100%',
    backgroundColor: WHITE_COLOR,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: NUNITO_SANS_BOLD,
    marginLeft: 8,
    color: TEXT_COLOR,
  },
})
