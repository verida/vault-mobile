/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SlidingDot } from 'react-native-animated-pagination-dots'
import PagerView, {
  PagerViewOnPageScrollEventData,
} from 'react-native-pager-view'

import ChevronRightIcon from 'assets/icons/chevron_right.svg'
import { WHITE_COLOR } from 'constants/color'
import { MainStackParams } from 'navigation/types'

import { BLACK_COLOR_OPACITY } from '../../../constants/color'
import { NUNITO_SANS } from '../../../constants/text'

const bgImage = require('assets/home_banner.png')

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

type TBannerList = {
  label: string
  screen: any
}

const WIDTH = Dimensions.get('window').width

export default function PaginationDotsExample() {
  const [bannerList] = useState<TBannerList[] | []>([])
  const ref = React.useRef<PagerView>(null)
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current
  const positionAnimatedValue = React.useRef(new Animated.Value(0)).current
  const inputRange = [0, bannerList.length]
  const scrollX = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  ).interpolate({
    inputRange,
    outputRange: [0, bannerList.length * WIDTH],
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

  const handleBannerAction = (screen: any) => {
    navigation.navigate(screen)
  }

  const Banner = (
    <View>
      <ImageBackground
        source={bgImage}
        resizeMode='cover'
        style={styles.bannerBgImage}>
        <Pressable
          style={styles.bannerButton}
          onPress={() => handleBannerAction('PublicProfile')}>
          <Text style={styles.buttonText}>Claim Your Badges</Text>
          <View>
            <ChevronRightIcon />
          </View>
        </Pressable>
      </ImageBackground>
    </View>
  )

  if (!bannerList.length) {
    return Banner
  }

  return (
    <View>
      <AnimatedPagerView
        initialPage={0}
        ref={ref}
        style={styles.PagerView}
        onPageScroll={onPageScrollHandler}>
        {bannerList.map((item) => (
          <View key={item.label}>
            <ImageBackground
              source={bgImage}
              resizeMode='cover'
              style={styles.bannerBgImage}>
              <Pressable
                style={styles.bannerButton}
                onPress={() => handleBannerAction(item.screen)}>
                <Text style={styles.buttonText}>{item.label}</Text>
                <View>
                  <ChevronRightIcon />
                </View>
              </Pressable>
            </ImageBackground>
          </View>
        ))}
      </AnimatedPagerView>
      <View style={styles.dotsContainer}>
        <View style={styles.dotContainer}>
          <SlidingDot
            marginHorizontal={3}
            containerStyle={{ top: 10 }}
            data={bannerList}
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
  bannerBgImage: {
    position: 'relative',
    height: 152,
    marginHorizontal: -23,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  buttonText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
    color: WHITE_COLOR,
  },
  bannerButton: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 4,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: BLACK_COLOR_OPACITY(0.4),
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
  },
  PagerView: {
    height: 152,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
