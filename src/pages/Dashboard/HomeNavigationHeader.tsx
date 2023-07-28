import { useTheme } from 'contexts/ThemeContext'
import { selectSelectedAccount } from 'features/identities'
import {
  fetchPublicProfileData,
  selectPublicProfilesLoadingState,
  selectSelectedPublicProfile,
} from 'features/profiles'
import { Left, Right } from 'native-base'
import React, { useEffect } from 'react'
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useDispatch } from 'react-redux'

import EnvelopeSvg from 'assets/icons/envelope.svg'
import SettingsSvg from 'assets/icons/settings.svg'
import { ShimmerPlaceholder } from 'components/ShimmerPlaceholder'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { useAppSelector } from 'reduxStore/types'

export type HomeNavigationHeaderProps = Omit<ViewProps, 'children'> & {
  inboxCount: number
  onAvatarPress: () => void
  onNamePress: () => void
  onInboxPress: () => void
  onSettingsPress: () => void
}

const userImg = require('assets/stubs/avatar.png')

const MAX_MESSAGE_COUNT = 21
const HITSLOP = { top: 10, right: 10, bottom: 10, left: 10 }

function HomeNavigationHeader(props: HomeNavigationHeaderProps) {
  const {
    inboxCount,
    onAvatarPress,
    onNamePress,
    onInboxPress,
    onSettingsPress,
    ...rest
  } = props
  const { top } = useSafeAreaInsets()
  const { theme } = useTheme()
  const dispatch = useDispatch()
  const selectAccount = useAppSelector(selectSelectedAccount)
  const did = selectAccount?.did
  const { avatar, name } = useAppSelector(selectSelectedPublicProfile)
  const loadingState = useAppSelector((state) =>
    selectPublicProfilesLoadingState(state, did!)
  )

  useEffect(() => {
    if (did) dispatch(fetchPublicProfileData(did!))
  }, [did, dispatch])

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: top + theme.spacing.s,
        },
      ]}
      {...rest}>
      <Left style={styles.leftContainer}>
        <View style={styles.left}>
          <ShimmerPlaceholder
            visible={!loadingState.loading}
            width={40}
            height={40}
            shimmerStyle={{ borderRadius: 20 }}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={onAvatarPress}>
              <FastImage
                source={avatar || userImg}
                resizeMode={FastImage.resizeMode.cover}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </ShimmerPlaceholder>

          <View style={styles.titleContainer}>
            <ShimmerPlaceholder
              visible={!loadingState.loading}
              style={{ marginLeft: 6, marginRight: 6 }}
              shimmerStyle={{ borderRadius: 4 }}
              width={80}
              height={32}>
              <TouchableOpacity style={styles.nameButton} onPress={onNamePress}>
                <Text
                  style={styles.name}
                  lineBreakMode='tail'
                  numberOfLines={1}>
                  {name}
                </Text>
                <AntDesign name={'caretdown'} size={10} color={'#041133'} />
              </TouchableOpacity>

              <View style={styles.network}>
                <Image
                  source={require('assets/icons/wifi.png')}
                  style={styles.networkIcon}
                />
                <Text style={styles.networkText}>Testnet</Text>
              </View>
            </ShimmerPlaceholder>
          </View>
        </View>
      </Left>
      <Right>
        <View style={styles.right}>
          <TouchableOpacity
            style={styles.inboxButton}
            onPress={onInboxPress}
            hitSlop={HITSLOP}>
            <EnvelopeSvg fill={theme.color.icon} />
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
            hitSlop={HITSLOP}>
            <SettingsSvg fill={theme.color.icon} />
          </TouchableOpacity>
        </View>
      </Right>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    elevation: 1,
    paddingLeft: 16,
    flexDirection: 'row',
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    fontSize: 18,
    marginRight: 8.4,
    fontFamily: NUNITO_SANS_BOLD,
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
    backgroundColor: '#FF6E6E',
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
  networkText: {
    fontSize: 12,
    color: '#687085',
  },
  networkIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginRight: 5,
  },
})

export default HomeNavigationHeader
