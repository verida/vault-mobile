import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'

import { TEXT_COLOR, WHITE_COLOR } from 'constants/color'

import { BLACK_COLOR_OPACITY } from '../../constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from '../../constants/text'

export interface SegmentData {
  title?: string
}

export type SegmentProps = React.ComponentProps<typeof View> & {
  segments?: SegmentData[]
  selected?: boolean
  initialIndex?: number
  enabled?: boolean
  onChangedSegmentIndex: (index: number) => void
}

const SegmentControl = React.memo((props: SegmentProps) => {
  const {
    segments = [],
    style,
    initialIndex = 0,
    onChangedSegmentIndex,
    enabled = true,
  } = props
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const touchOnSegment = useCallback(
    (idx: number) => {
      if (enabled) {
        onChangedSegmentIndex(idx)
        setSelectedIndex(idx)
      }
    },
    [enabled, onChangedSegmentIndex]
  )

  return (
    <View style={[styles.container, style]}>
      <View style={styles.containerContent}>
        {segments.map((data, index) => (
          <TouchableWithoutFeedback
            key={`${data.title}-${index}`}
            onPress={() => touchOnSegment(index)}
            hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}>
            <View
              key={`${data.title}-${index}`}
              style={[
                index === selectedIndex
                  ? styles.segmentButtonFocused
                  : styles.segmentButtonNormal,
                { width: `${100 / segments.length}%` },
              ]}>
              <Text
                style={[
                  index === selectedIndex ? styles.textFocused : styles.text,
                ]}>
                {data.title}
              </Text>
              {index > 0 &&
                index !== selectedIndex &&
                index !== selectedIndex + 1 && <View style={styles.line} />}
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    height: 32,
    backgroundColor: BLACK_COLOR_OPACITY(0.12),
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
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

export default SegmentControl
