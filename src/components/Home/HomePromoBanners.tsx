/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useTheme } from 'contexts/ThemeContext'
import { HomeScreenPromoBanner, promoBanners } from 'features/homeScreen'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import {
  Animated,
  Dimensions,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from 'react-native'
import { SlidingDot } from 'react-native-animated-pagination-dots'
import PagerView, {
  PagerViewOnPageScrollEventData,
} from 'react-native-pager-view'

import { Icon } from 'components/Icon'
import { BLACK_COLOR_OPACITY, WHITE_COLOR_OPACITY } from 'constants/color'
import { Theme } from 'styles/types'

const logger = new Logger('HomePromoBanners')

const AnimatedBannersView = Animated.createAnimatedComponent(PagerView)

const windowWidth = Dimensions.get('window').width

type HomePromoBannersProps = ViewProps

export const HomePromoBanners: React.FC<HomePromoBannersProps> = (props) => {
  const { ...viewProps } = props

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  const animatedBannerViewRef = React.useRef<PagerView>(null)
  const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current
  const positionAnimatedValue = React.useRef(new Animated.Value(0)).current
  const inputRange = [0, promoBanners.length]
  const scrollX = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  ).interpolate({
    inputRange,
    outputRange: [0, promoBanners.length * windowWidth],
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

  const handleBannerPress = useCallback(
    async (banner: HomeScreenPromoBanner) => {
      try {
        switch (banner.actionType) {
          case 'link': {
            Linking.openURL(banner.actionValue)
            break
          }
          // TODO: Handle opening screen from banner
          // case 'screen':
          //   navigation.navigate(banner.actionValue)
          //   break
        }
      } catch (error: unknown) {
        logger.error(error)
      }
    },
    []
  )

  if (promoBanners.length === 0) {
    return null
  }

  const banners = promoBanners.map((banner) => (
    <View key={banner.key} style={styles.bannerContainer}>
      <ImageBackground
        source={banner.image}
        resizeMode='cover'
        borderRadius={theme.roundness.xs}
        style={styles.bannerContent}>
        <Pressable
          style={styles.bannerButton}
          onPress={() => handleBannerPress(banner)}>
          <Text style={styles.bannerButtonLabel}>{banner.buttonLabel}</Text>
          <Icon
            name='chevron-forward'
            color={theme.color.onPrimary}
            size={24}
          />
        </Pressable>
      </ImageBackground>
    </View>
  ))

  // When one banner returns a simple version without the animation and dots
  if (promoBanners.length === 1) {
    return <View {...viewProps}>{banners}</View>
  }

  // When there is more than one banners, returned the animated version with the dot indicator
  return (
    <View {...viewProps}>
      <View>
        <AnimatedBannersView
          initialPage={0}
          ref={animatedBannerViewRef}
          style={styles.bannersView}
          onPageScroll={handleBannerScroll}>
          {banners}
        </AnimatedBannersView>
        <View style={styles.dotsWrapper}>
          <SlidingDot
            marginHorizontal={3}
            containerStyle={styles.dotsContainer}
            dotStyle={styles.inactiveDot}
            slidingIndicatorStyle={styles.slidingDot}
            data={promoBanners}
            //@ts-ignore
            scrollX={scrollX}
            dotSize={8}
          />
        </View>
      </View>
    </View>
  )
}

const bannerAspectRation = 328 / 152

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    bannersView: {
      height: (windowWidth - 2 * theme.spacing.m) / bannerAspectRation, // Gives a necessary height to the banner view, the same we want for the banners, so have to take into account the spacing
    },
    bannerContainer: {
      paddingHorizontal: theme.spacing.m,
    },
    bannerContent: {
      aspectRatio: bannerAspectRation,
      justifyContent: 'flex-end',
      padding: theme.spacing.m,
    },
    bannerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.s,
      paddingLeft: theme.spacing.m,
      paddingRight: theme.spacing.s,
      borderWidth: 1,
      borderRadius: theme.roundness.xs,
      borderColor: theme.color.onPrimary,
      backgroundColor: WHITE_COLOR_OPACITY(0.3),
      shadowColor: BLACK_COLOR_OPACITY(0.4),
      shadowOffset: {
        height: 4,
        width: 0,
      },
      shadowOpacity: 1,
      shadowRadius: theme.roundness.xs,
      elevation: 8,
    },
    bannerButtonLabel: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.375,
      color: theme.color.onPrimary,
    },
    dotsWrapper: {
      paddingTop: theme.spacing.s,
    },
    dotsContainer: {
      // reseting the default style
      position: 'relative',
      bottom: 0,
    },
    inactiveDot: {
      backgroundColor: theme.color.lightGrey,
      opacity: 1,
    },
    slidingDot: {
      backgroundColor: theme.color.primary,
    },
  })
