/* eslint-disable @typescript-eslint/ban-ts-comment */
// import React from 'react'
// import { StyleSheet, View } from 'react-native'
// import PagerView from 'react-native-pager-view'
// import Animated, { useEvent, useHandler } from 'react-native-reanimated'

// import AlternativeBanner from 'assets/icons/alternative_banner.svg'

// const AnimatedPager = Animated.createAnimatedComponent(PagerView)

// export function usePagerScrollHandler(handlers: any, dependencies?: any) {
//   const { context, doDependenciesDiffer } = useHandler(handlers, dependencies)
//   const subscribeForEvents = ['onPageScroll']

//   return useEvent<any>(
//     (event) => {
//       'worklet'
//       const { onPageScroll } = handlers
//       if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
//         onPageScroll(event, context)
//       }
//     },
//     subscribeForEvents,
//     doDependenciesDiffer
//   )
// }

// export default () => {
//   const handler = usePagerScrollHandler({
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     onPageScroll: (e: any) => {
//       'worklet'
//       // console.log(e.offset, e.position)
//     },
//   })

//   return (
//     <AnimatedPager
//       style={styles.pagerView}
//       initialPage={0}
//       onPageScroll={handler}>
//       <View key='1'>
//         <AlternativeBanner />
//       </View>
//       <View key='2'>
//         <AlternativeBanner />
//       </View>
//       <View key='3'>
//         <AlternativeBanner />
//       </View>
//     </AnimatedPager>
//   )
// }

// const styles = StyleSheet.create({
//   pagerView: {
//     flex: 1,
//     height: 200,
//     width: '100%',
//     // flexDirection: 'column',
//     // justifyContent: 'center',
//     //     alignItems: 'center',
//     //     height: 152,
//     //     width: 455,
//     //     marginBottom: 8,
//     //     borderRadius: 4,
//     //     backgroundColor: 'transparent',
//   },
// })

import React from 'react'
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'
import {
  // ExpandingDot,
  // ScalingDot,
  // SlidingBorder,
  SlidingDot,
} from 'react-native-animated-pagination-dots'
import PagerView, {
  PagerViewOnPageScrollEventData,
} from 'react-native-pager-view'

import AlternativeBanner from 'assets/icons/alternative_banner.svg'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const INTRO_DATA = [
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

export default function PaginationDotsExample() {
  const width = Dimensions.get('window').width
  const ref = React.useRef<PagerView>(null)
  const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current
  const positionAnimatedValue = React.useRef(new Animated.Value(0)).current
  const inputRange = [0, INTRO_DATA.length]
  const scrollX = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  ).interpolate({
    inputRange,
    outputRange: [0, INTRO_DATA.length * width],
  })

  const onPageScroll = React.useMemo(
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
          useNativeDriver: false,
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <View style={styles.flex}>
      <AnimatedPagerView
        initialPage={0}
        ref={ref}
        style={styles.PagerView}
        onPageScroll={onPageScroll}>
        {INTRO_DATA.map((item) => (
          <View key={item.key} style={styles.center}>
            <Text style={styles.text}>{`Page Index: ${item.key}`}</Text>
            <AlternativeBanner />
          </View>
        ))}
      </AnimatedPagerView>
      <View style={styles.dotsContainer}>
        <View style={styles.dotContainer}>
          <Text>Sliding Dot</Text>
          <SlidingDot
            marginHorizontal={3}
            containerStyle={{ top: 30 }}
            data={INTRO_DATA}
            //@ts-ignore
            scrollX={scrollX}
            dotSize={12}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  PagerView: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 20,
    height: 200,
    width: '100%',
  },
  text: {
    fontSize: 30,
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
