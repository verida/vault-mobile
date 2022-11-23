/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Based on @craftzdog https://github.com/craftzdog/react-native-checkbox-reanimated
 * Note: This little animation component style is not flexible, so I put it here for styling it easily.
 */

import { useTheme } from 'contexts/ThemeContext'
import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { Spacer } from 'components/Spacer'
import { Text } from 'components/Typography/Text'

import AnimatedDots from './AnimatedDots'
import AnimatedStroke from './AnimatedStroke'

const MARGIN = 10
const vWidth = 64 + MARGIN
const vHeight = 64 + MARGIN
const outlineBoxPath =
  'M24 0.5H40C48.5809 0.5 54.4147 2.18067 58.117 5.88299C61.8193 9.58532 63.5 15.4191 63.5 24V40C63.5 48.5809 61.8193 54.4147 58.117 58.117C54.4147 61.8193 48.5809 63.5 40 63.5H24C15.4191 63.5 9.58532 61.8193 5.88299 58.117C2.18067 54.4147 0.5 48.5809 0.5 40V24C0.5 15.4191 2.18067 9.58532 5.88299 5.88299C9.58532 2.18067 15.4191 0.5 24 0.5Z'

const successTick = 'M3 18.9307L14.9328 30.8788L43 3'
const failureCross = 'M3 3L43 43M43 3L3 43'

const AnimatedPath = Animated.createAnimatedComponent(Path)

interface Props {
  checked?: boolean
  highlightColor: string
  checkmarkColor: string
  boxOutlineColor: string
  showLoading?: boolean
  loading?: boolean
  failed?: boolean
  label?: string
}

const CheckSuccess = (props: Props) => {
  const { checked, checkmarkColor, highlightColor, boxOutlineColor } = props
  const { theme } = useTheme()
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = 0
    progress.value = withTiming(checked ? 1 : 0, {
      duration: checked ? 300 : 100,
      easing: Easing.linear,
    })
  }, [checked, progress])

  const animatedBoxProps = useAnimatedProps(
    () => ({
      stroke: interpolateColor(
        Easing.bezierFn(0.16, 1, 0.3, 1)(progress.value),
        [0, 1],
        [boxOutlineColor, highlightColor],
        'RGB'
      ),
      fill: interpolateColor(
        Easing.bezierFn(0.16, 1, 0.3, 1)(progress.value),
        [0, 1],
        ['#00000000', theme.color.success],
        'RGB'
      ),
    }),
    [highlightColor, boxOutlineColor]
  )

  return (
    <Svg
      viewBox={[-MARGIN, -MARGIN, vWidth + MARGIN, vHeight + MARGIN].join(' ')}>
      <AnimatedStroke
        progress={progress}
        d={successTick}
        stroke={theme.color.onSuccess}
        strokeWidth={10}
        strokeLinejoin='round'
        strokeLinecap='round'
        translateX={14}
        translateY={16}
        scale={0.7}
        strokeOpacity={checked || false ? 1 : 0}
      />
      <AnimatedPath
        d={outlineBoxPath}
        strokeWidth={7}
        strokeLinejoin='round'
        strokeLinecap='round'
        animatedProps={animatedBoxProps}
      />
      <AnimatedStroke
        progress={progress}
        d={successTick}
        stroke={checkmarkColor}
        strokeWidth={10}
        translateX={14}
        translateY={16}
        scale={0.7}
        strokeLinejoin='round'
        strokeLinecap='round'
        strokeOpacity={checked || false ? 1 : 0}
      />
    </Svg>
  )
}

const CheckFail = (props: Props) => {
  const { checked, boxOutlineColor } = props
  const { theme } = useTheme()
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, {
      duration: checked ? 300 : 100,
      easing: Easing.linear,
    })
  }, [checked, progress])

  const animatedBoxProps = useAnimatedProps(
    () => ({
      stroke: interpolateColor(
        Easing.bezierFn(0.16, 1, 0.3, 1)(progress.value),
        [0, 1],
        [boxOutlineColor, theme.color.error],
        'RGB'
      ),
      fill: interpolateColor(
        Easing.bezierFn(0.16, 1, 0.3, 1)(progress.value),
        [0, 1],
        ['#00000000', theme.color.error],
        'RGB'
      ),
    }),
    [boxOutlineColor]
  )

  return (
    <Svg
      viewBox={[-MARGIN, -MARGIN, vWidth + MARGIN, vHeight + MARGIN].join(' ')}>
      <AnimatedStroke
        progress={progress}
        d={failureCross}
        stroke={theme.color.error}
        strokeWidth={10}
        strokeLinejoin='round'
        strokeLinecap='round'
        translateX={13}
        translateY={13}
        scale={0.7}
        strokeOpacity={checked || false ? 1 : 0}
      />
      <AnimatedPath
        d={outlineBoxPath}
        strokeWidth={7}
        strokeLinejoin='round'
        strokeLinecap='round'
        animatedProps={animatedBoxProps}
      />
      <AnimatedStroke
        progress={progress}
        d={failureCross}
        stroke={theme.color.onError}
        strokeWidth={10}
        translateX={13}
        translateY={13}
        scale={0.7}
        strokeLinejoin='round'
        strokeLinecap='round'
        strokeOpacity={checked || false ? 1 : 0}
      />
    </Svg>
  )
}

const AnimatedCheckbox = (props: Props) => {
  const { showLoading, label, checked, failed } = props
  const { theme } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          minWidth: 32,
          minHeight: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {showLoading ? (
          <ActivityIndicator size='small' />
        ) : failed ? (
          <AntDesign name='closecircle' size={20} color={theme.color.error} />
        ) : checked ? (
          <AntDesign name='checkcircle' size={20} color={theme.color.success} />
        ) : (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: theme.color.gray300,
            }}
          />
        )}
      </View>
      {label && (
        <>
          <Spacer width={10} />
          <Text>{label}</Text>
        </>
      )}
    </View>
  )
}

AnimatedCheckbox.defaultProps = {
  showLoading: false,
  checked: undefined,
  failed: undefined,
}

export default AnimatedCheckbox
