import { EnvironmentType } from '@verida/types'
import { IdentityAvatar } from 'components'
import { useTheme } from 'contexts/ThemeContext'
import { getNetworkFromDID, selectSelectedAccount } from 'features/identities'
import {
  fetchPublicProfileData,
  selectPublicProfilesLoadingState,
  selectSelectedPublicProfile,
} from 'features/profiles'
import { Left, Right } from 'native-base'
import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
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
  const network = did ? getNetworkFromDID(did) : EnvironmentType.MAINNET

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
          <TouchableOpacity style={styles.avatarButton} onPress={onAvatarPress}>
            <IdentityAvatar
              style={styles.avatar}
              source={avatar}
              network={network}
              networkIndicatorSize='compact'
              loading={!loadingState.loading}
            />
          </TouchableOpacity>

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
    width: 52,
    height: 52,
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
})

export default HomeNavigationHeader
