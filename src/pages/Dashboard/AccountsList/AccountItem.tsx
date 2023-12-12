import { EnvironmentType } from '@verida/types'
import { IdentityAvatar } from 'components'
import { LinearGradient } from 'expo-linear-gradient'
import { getNetworkFromDID, selectSelectedAccount } from 'features/identities'
import {
  selectPublicProfileByDid,
  selectPublicProfilesLoadingState,
} from 'features/profiles'
import React from 'react'
import {
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

import { ShimmerPlaceholder } from 'components/ShimmerPlaceholder'
import { SNOW_COLOR, SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useAppSelector } from 'reduxStore/types'

export type AccountItemProps = Omit<ViewProps, 'children'> & {
  name: string
  did: string
  avatar?: ImageSourcePropType
  selected: boolean
  onSelect: (did: string) => void
  multipleSelect?: boolean
}

export function AccountItem(props: AccountItemProps) {
  const { did, selected, onSelect, multipleSelect } = props
  const selectedAccount = useAppSelector(selectSelectedAccount)
  const { avatar, name } = useAppSelector((state) =>
    selectPublicProfileByDid(state, did)
  )
  const loadingState = useAppSelector((state) =>
    selectPublicProfilesLoadingState(state, did!)
  )

  const { width } = useWindowDimensions()

  function onPress() {
    onSelect(did)
  }

  const network = did ? getNetworkFromDID(did) : EnvironmentType.MAINNET

  const isCurrentAccount = selectedAccount?.did === did

  function renderCheckbox() {
    if (!multipleSelect) {
      return null
    }

    return selected ? (
      <AntDesign name='checkcircle' size={20} color={SUCCESS_COLOR} />
    ) : (
      <Entypo name='circle' size={20} color={SUCCESS_COLOR} />
    )
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentAccount && styles.currentAccountContainer,
      ]}
      onPress={onPress}>
      <IdentityAvatar
        style={styles.avatar}
        source={avatar}
        network={network}
        size='compact'
        loading={!loadingState.loading}
      />
      <View style={styles.info}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          visible={!loadingState.loading}
          width={0.7 * width}
          height={22}
          shimmerStyle={{ borderRadius: 6 }}>
          <Text style={styles.name}>{name}</Text>
        </ShimmerPlaceholder>
        <Text style={styles.did}>{did}</Text>
      </View>
      {renderCheckbox()}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 45,
    height: 45,
  },
  info: {
    flex: 1,
    marginHorizontal: 16,
  },
  name: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 16,
  },
  did: {
    color: '#041133',
    opacity: 0.6,
    fontSize: 14,
  },
  currentAccountContainer: {
    backgroundColor: SNOW_COLOR,
  },
})
