import { useTheme } from 'contexts/ThemeContext'
import React, { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { SUCCESS_COLOR } from 'constants/color'

const Dot = ({ delay, dotSize }: { delay: number; dotSize: number }) => {
  const progress = useSharedValue(0)
  const { theme } = useTheme()
  const ballStyle = useMemo(
    () => ({
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: theme.color.success,
      margin: 1,
    }),
    [dotSize, theme.color.success]
  )
  const dotStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: progress.value,
        },
      ],
    }
  })
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 750,
        }),
        -1,
        true
      )
    )
  }, [])
  return <Animated.View style={[ballStyle, dotStyle]} />
}

type Props = {
  dotSize: number
}

const AnimatedDots = ({ dotSize }: Props) => {
  return (
    <View style={styles.loadingContainer}>
      <Dot delay={0} dotSize={dotSize} />
      <Dot delay={250} dotSize={dotSize} />
      <Dot delay={500} dotSize={dotSize} />
    </View>
  )
}

AnimatedDots.defaultProps = {
  dotSize: 8,
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default AnimatedDots
