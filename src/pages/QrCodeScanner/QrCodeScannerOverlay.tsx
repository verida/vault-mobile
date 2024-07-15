import React from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Defs, Mask, Rect, Svg } from 'react-native-svg'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import Text from '~/components/Text'
import { GREY_COLOR, WHITE_COLOR } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'

export type QrCodeScannerOverlayProps = Omit<ViewProps, 'children'> & {
  processing: boolean
  isFlashOn: boolean
  onToggleFlash: () => void
  onClose: () => void
  firstTime: boolean
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen')
const AIM_VIEW_SIZE = SCREEN_WIDTH * 0.8

export const QrCodeScannerOverlay: React.FunctionComponent<
  QrCodeScannerOverlayProps
> = (props) => {
  const {
    isFlashOn,
    onToggleFlash,
    onClose,
    firstTime = false,
    processing,
  } = props

  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <Svg
        height='200%' // FIXME: Investigate why a value higher than 100% is needed. Otherwise there is a white space at the bottom of the screen.
        width='100%'
        x='0'
        y='0'>
        <Defs>
          <Mask id='mask' x='0' y='0' height='100%' width='100%'>
            <Rect x='0' y='0' height='100%' width='100%' fill={'#fff'} />
            {processing ? null : (
              <Rect
                x={(SCREEN_WIDTH - AIM_VIEW_SIZE) / 2}
                y={(SCREEN_HEIGHT - AIM_VIEW_SIZE) / 2}
                height={AIM_VIEW_SIZE}
                width={AIM_VIEW_SIZE}
                fill={'#000'}
                rx={15}
                ry={15}
              />
            )}
          </Mask>
        </Defs>
        <Rect
          height='100%'
          width='100%'
          fill='rgba(0, 0, 0, 0.5)'
          mask='url(#mask)'
        />
      </Svg>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}>
        {processing ? (
          <View style={styles.processingIndicator}>
            <ActivityIndicator color={WHITE_COLOR} size='large' />
          </View>
        ) : null}
        <View style={styles.safeContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Ionicons name='close-sharp' size={24} color={WHITE_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flashToggleButton}
            onPress={onToggleFlash}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <MaterialIcons
              name={isFlashOn ? 'flash-off' : 'flash-on'}
              size={24}
              color={WHITE_COLOR}
            />
          </TouchableOpacity>
          {firstTime && (
            <View style={styles.footer}>
              <Text style={styles.footerNote}>No QR code?</Text>
              <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                <Text style={styles.skipButtonText}>Skip this step</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  flashToggleButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  safeContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  processingIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: 20 }],
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    width: '100%',
    alignItems: 'center',
  },
  footerNote: {
    color: GREY_COLOR,
    marginBottom: 8,
  },
  skipButton: {
    backgroundColor: GREY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  skipButtonText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 16,
  },
})
