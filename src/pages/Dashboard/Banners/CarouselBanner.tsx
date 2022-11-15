/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'
import { SlidingDot } from 'react-native-animated-pagination-dots'
import PagerView, {
  PagerViewOnPageScrollEventData,
} from 'react-native-pager-view'

import AlternativeBanner from 'assets/icons/alternative_banner.svg'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const BANNER_LIST = [
  {
    key: '1',
    title: 'First Image',
    icon: <AlternativeBanner />,
  },
  {
    key: '2',
    title: 'Second Image',
    icon: <AlternativeBanner />,
  },
  {
    key: '3',
    title: 'Third Image',
    icon: <AlternativeBanner />,
  },
]

const WIDTH = Dimensions.get('window').width

export default function PaginationDotsExample() {
  const ref = React.useRef<PagerView>(null)
  const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current
  const positionAnimatedValue = React.useRef(new Animated.Value(0)).current
  const inputRange = [0, BANNER_LIST.length]
  const scrollX = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  ).interpolate({
    inputRange,
    outputRange: [0, BANNER_LIST.length * WIDTH],
  })

  const onPageScrollHandler = React.useMemo(
    () =>
      Animated.event<PagerViewOnPageScrollEventData>(
        [
          {
            nativeEvent: {
              offset: scrollOffsetAnimatedValue,
              position: positionAnimatedValue,
            },
          },
        ],
        {
          useNativeDriver: true,
        }
      ),
    []
  )

  return (
    <View style={styles.flex}>
      <AnimatedPagerView
        initialPage={0}
        ref={ref}
        style={styles.PagerView}
        onPageScroll={onPageScrollHandler}>
        {BANNER_LIST.map((item) => (
          <View key={item.key} style={styles.center}>
            <AlternativeBanner />
          </View>
        ))}
      </AnimatedPagerView>
      <View style={styles.dotsContainer}>
        <View style={styles.dotContainer}>
          <SlidingDot
            marginHorizontal={3}
            containerStyle={{ top: 10 }}
            data={BANNER_LIST}
            //@ts-ignore
            scrollX={scrollX}
            dotSize={8}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    marginBottom: 30,
    marginHorizontal: 16,
  },
  PagerView: {
    flex: 1,
    height: 152,
    width: 343,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
  },
  dotsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  dotContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
})
