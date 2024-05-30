import React from 'react'
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'

import { BLACK_COLOR_OPACITY, TEXT_COLOR, WHITE_COLOR } from '~/constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from '~/constants/text'

export interface SegmentData {
  key: string
  title: string
}

export type SegmentsControlProps = React.ComponentProps<typeof View> & {
  segments: SegmentData[]
  activeSegmentIndex: number
  onSegmentPress: (index: number) => void
}

export const SegmentsControl: React.FC<SegmentsControlProps> = (props) => {
  const { segments, style, activeSegmentIndex, onSegmentPress } = props

  return (
    <View style={[styles.container, style]}>
      <View style={styles.containerContent}>
        {segments.map((segment, index) => (
          <TouchableWithoutFeedback
            key={segment.key}
            onPress={() => onSegmentPress(index)}
            hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}>
            <View
              key={segment.key}
              style={[
                index === activeSegmentIndex
                  ? styles.segmentButtonFocused
                  : styles.segmentButtonNormal,
                { width: `${100 / segments.length}%` },
              ]}>
              <Text
                style={[
                  index === activeSegmentIndex
                    ? styles.textFocused
                    : styles.text,
                ]}>
                {segment.title}
              </Text>
              {index > 0 &&
                index !== activeSegmentIndex &&
                index !== activeSegmentIndex + 1 && (
                  <View style={styles.line} />
                )}
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    backgroundColor: BLACK_COLOR_OPACITY(0.12),
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    color: TEXT_COLOR,
  },
  containerContent: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    flexGrow: 1,
    height: 28,
  },
  textFocused: {
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_COLOR,
    letterSpacing: -0.08,
  },
  text: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_COLOR,
  },
  segmentButtonNormal: {
    flexDirection: 'row',
    borderRadius: 6.93,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  segmentButtonFocused: {
    flexDirection: 'row',
    backgroundColor: WHITE_COLOR,
    height: 28,
    borderRadius: 6.93,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOpacity: 1,
    shadowRadius: 1,
    fontWeight: 700,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  line: {
    position: 'absolute',
    left: 0,
    marginTop: 6,
    marginBottom: 6,
    width: 1,
    height: 17,
    backgroundColor: BLACK_COLOR_OPACITY(0.36),
  },
})
