/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from 'contexts/ThemeContext'
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
import { WHITE_COLOR, WHITE_COLOR_OPACITY } from 'constants/color'
import { MainStackParams } from 'navigation/types'

import { BLACK_COLOR_OPACITY } from '../../../constants/color'
import { NUNITO_SANS } from '../../../constants/text'

const claimBadgesBannerImage = require('assets/home_promo_banners/claim_badges.png')
const veridaOneBannerImage = require('assets/home_promo_banners/verida_one.png')

const AnimatedBannersView = Animated.createAnimatedComponent(PagerView)

type TBanner = {
  label: string
  image: any
  screen: string
}

const bannerDefinitions: TBanner[] = [
  {
    label: 'Claim Your Verida Badges',
    image: claimBadgesBannerImage,
    screen: 'PublicProfile',
  },
  {
    label: 'Join The Waitlist',
    image: veridaOneBannerImage,
    screen: 'PublicProfile',
  },
]

const WIDTH = Dimensions.get('window').width

export default function PromotionalBannersCarousel() {
  const { theme } = useTheme()
  const [bannerList] = useState<TBanner[]>(bannerDefinitions)
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

  const handleBannerScroll = React.useMemo(
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

  const handleBannerPress = (screen: any) => {
    navigation.navigate(screen)
  }

  const banners = bannerList.map((banner) => (
    <View key={banner.label} style={styles.bannerContainer}>
      <ImageBackground
        source={banner.image}
        resizeMode='cover'
        borderRadius={4}
        style={styles.bannerBgImage}>
        <Pressable
          style={styles.bannerButton}
          onPress={() => handleBannerPress(banner.screen)}>
          <Text style={styles.bannerButtonLabel}>{banner.label}</Text>
          <View>
            <ChevronRightIcon fill={theme.color.icon} />
          </View>
        </Pressable>
      </ImageBackground>
    </View>
  ))

  // When no banner returns an empty View (will be stylised in Home)
  // When one banner returns a simple version without the animation and dots
  if (bannerList.length <= 1) {
    return <View>{banners}</View>
  }

  return (
    <View>
      <AnimatedBannersView
        initialPage={0}
        ref={ref}
        style={styles.bannersView}
        onPageScroll={handleBannerScroll}>
        {banners}
      </AnimatedBannersView>
      {bannerList.length > 1 && (
        <View style={styles.dotsContainer}>
          <SlidingDot
            marginHorizontal={3}
            containerStyle={{ position: 'relative', top: 0 }}
            data={bannerList}
            //@ts-ignore
            scrollX={scrollX}
            dotSize={8}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  bannerContainer: {
    paddingHorizontal: 16,
  },
  bannerBgImage: {
    position: 'relative',
    height: 152, // Have to set the height of the image
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  bannerButtonLabel: {
    fontFamily: NUNITO_SANS,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
    color: WHITE_COLOR,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: WHITE_COLOR_OPACITY(0.3),
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
  bannersView: {
    height: 152, // Give the same height as the background image
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    paddingTop: 9,
  },
})
