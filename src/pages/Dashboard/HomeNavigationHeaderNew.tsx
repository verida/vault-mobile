import React from 'react'
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getTruncatedWalletAddress } from 'wallet/helpers/tokens'

import ChevronRightIcon from 'assets/icons/chevron_right_dark.svg'
import EnvelopeSvg from 'assets/icons/envelope.svg'
import SettingsSvg from 'assets/icons/settings.svg'
import Text from 'components/Text'
import {
  PRIMARY_COLOR_200,
  SEPARATOR_EXTRA_LIGHT,
  TEXT_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

import { ORANGE_COLOR } from '../../constants/color'

export type HomeNavigationHeaderProps = Omit<ViewProps, 'children'> & {
  avatar: ImageSourcePropType
  name: string
  did: string
  inboxCount: number
  onAvatarPress: () => void
  onNamePress: () => void
  onInboxPress: () => void
  onSettingsPress?: () => void
}

const MAX_MESSAGE_COUNT = 21
const HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 }

function HomeNavigationHeader(props: HomeNavigationHeaderProps) {
  const {
    did,
    avatar,
    name,
    inboxCount,
    onAvatarPress,
    onNamePress,
    onInboxPress,
    onSettingsPress,
    ...rest
  } = props

  return (
    <SafeAreaView edges={['left', 'top', 'right']}>
      <View style={[styles.header]} {...rest}>
        <View style={styles.leftContainer}>
          <View style={styles.left}>
            <Pressable style={styles.avatarButton} onPress={onAvatarPress}>
              <FastImage
                source={avatar as any}
                resizeMode={FastImage.resizeMode.cover}
                style={styles.avatar}
              />
            </Pressable>
            <View style={styles.titleContainer}>
              <TouchableOpacity style={styles.nameButton} onPress={onNamePress}>
                <Text
                  style={styles.name}
                  lineBreakMode='tail'
                  numberOfLines={1}>
                  {name}
                </Text>
                <ChevronRightIcon />
              </TouchableOpacity>
              <View style={styles.network}>
                <View style={styles.textChipBox}>
                  <Text style={styles.textChip}>Personal</Text>
                </View>
                <Text style={styles.didText} numberOfLines={1}>
                  DID: {getTruncatedWalletAddress(did, 10)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.right}>
          <TouchableOpacity
            style={styles.inboxButton}
            onPress={onInboxPress}
            hitSlop={HIT_SLOP}>
            <EnvelopeSvg />
            {inboxCount ? (
              <View style={styles.badge}>
                <Text style={{ fontSize: 8 }} numberOfLines={1}>
                  {inboxCount >= MAX_MESSAGE_COUNT
                    ? `${MAX_MESSAGE_COUNT - 1}+`
                    : inboxCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
            hitSlop={HIT_SLOP}>
            <SettingsSvg />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: WHITE_COLOR,
    height: 80,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: SEPARATOR_EXTRA_LIGHT,
  },
  leftContainer: {
    flex: 2,
    marginRight: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  avatarButton: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 1000,
  },
  name: {
    fontSize: 20,
    marginRight: 4,
    fontFamily: NUNITO_SANS_BOLD,
    color: TEXT_COLOR,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 27,
  },
  textChipBox: {
    textAlign: 'center',
    marginRight: 8,
    fontFamily: NUNITO_SANS_BOLD,
    borderRadius: 53,
    paddingVertical: 2,
    paddingLeft: 7,
    backgroundColor: PRIMARY_COLOR_200,
  },
  textChip: {
    fontFamily: NUNITO_SANS,
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 20,
    marginRight: 8,
    textAlign: 'center',
    color: TEXT_COLOR,
    opacity: 0.8,
  },

  nameButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
    position: 'absolute',
    right: -8,
    top: -7,
    minHeight: 16,
    minWidth: 16,
    backgroundColor: ORANGE_COLOR,
    borderRadius: 8,
    overflow: 'hidden',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inboxButton: {
    marginHorizontal: 10,
  },
  settingsButton: {
    marginHorizontal: 10,
  },
  network: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  didText: {
    fontSize: 12,
    color: TEXT_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default HomeNavigationHeader
