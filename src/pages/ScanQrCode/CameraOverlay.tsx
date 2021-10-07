import { BLACK_COLOR_OPACITY, GREY_COLOR, WHITE_COLOR } from 'constants/color'
import React from 'react'
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Defs, Mask, Rect, Svg } from 'react-native-svg'
import Text from 'components/Text'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export type CameraOverlayProps = Omit<ViewProps, 'children'> & {
  isFlashOn: boolean
  onToggleFlash: () => void
  onClose: () => void
  firstTime: boolean
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen')
const AIM_VIEW_SIZE = SCREEN_WIDTH * 0.8

function CameraOverlay(props: CameraOverlayProps) {
  const { isFlashOn, onToggleFlash, onClose, firstTime = false } = props
  return (
    <View style={styles.container}>
      <Svg height='100%' width='100%'>
        <Defs>
          <Mask id='mask' x='0' y='0' height='100%' width='100%'>
            <Rect x='0' y='0' height='100%' width='100%' fill={'#fff'} />
            <Rect
              x={(SCREEN_WIDTH - AIM_VIEW_SIZE) / 2}
              y={(SCREEN_HEIGHT - AIM_VIEW_SIZE) / 2}
              height={AIM_VIEW_SIZE}
              width={AIM_VIEW_SIZE}
              fill={'#000'}
              rx={15}
              ry={15}
            />
          </Mask>
        </Defs>
        <Rect
          height='100%'
          width='100%'
          fill='rgba(0, 0, 0, 0.5)'
          mask='url(#mask)'
        />
      </Svg>
      <SafeAreaView style={styles.safeArea}>
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
      </SafeAreaView>
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
    width: '100%',
    height: '100%',
  },
  closeButton: {
    top: 20,
    left: 20,
  },
  aimView: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: (SCREEN_HEIGHT - AIM_VIEW_SIZE) / 2,
    borderLeftWidth: (SCREEN_WIDTH - AIM_VIEW_SIZE) / 2,
    borderBottomWidth: (SCREEN_HEIGHT - AIM_VIEW_SIZE) / 2,
    borderRightWidth: (SCREEN_WIDTH - AIM_VIEW_SIZE) / 2,
    borderColor: BLACK_COLOR_OPACITY(0.5),
  },
  aimViewCurve: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
    borderWidth: (SCREEN_WIDTH - AIM_VIEW_SIZE) / 2,
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

export default CameraOverlay
