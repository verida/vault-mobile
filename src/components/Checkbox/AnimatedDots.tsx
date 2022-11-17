import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { SUCCESS_COLOR } from 'constants/color'

const Dot = ({ delay }: { delay: number }) => {
  const progress = useSharedValue(0)

  const dotStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [0, 1]),
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
  return <Animated.View style={[styles.ballStyle, dotStyle]} />
}

const AnimatedDots = () => {
  return (
    <View style={styles.loadingContainer}>
      <Dot delay={0} />
      <Dot delay={250} />
      <Dot delay={500} />
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  ballStyle: {
    width: 10,
    height: 10,
    backgroundColor: SUCCESS_COLOR,
    borderRadius: 5,
    margin: 1,
  },
})

export default AnimatedDots
