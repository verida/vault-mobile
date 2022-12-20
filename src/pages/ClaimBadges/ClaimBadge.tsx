import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { getTruncatedWalletAddress } from 'wallet/helpers/tokens'

import { SELECTED_WALLET_STORAGE_KEY } from 'api/AccountManager'
import SettingsIcon from 'assets/settings_icon.svg'
import AddressesListItem from 'components/AddressesList/AddressesListItem'
import AppAlert from 'components/AppAlert/AppAlert'
import Button from 'components/Button'
import AppModal from 'components/modal/AppModal'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import WalletList from 'components/WalletList'
import {
  DARK_GREY_COLOR,
  LIGHTGREY_COLOR,
  TEXT_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { MainStackParams } from 'navigation/types'
import ClaimBadgeStatus from 'pages/ClaimBadges/ClaimBadgeStatus'
import { selectChains } from 'reduxStore/tokens/selectors'
import { setSelectedWallet } from 'reduxStore/wallet/actions'
import {
  getAddressList,
  getSelectedAddressById,
  getSelectedWalletId,
} from 'reduxStore/wallet/selectors'
import { BadgeType } from 'utils/types/badges'
import { WalletItem } from 'utils/types/wallets'

const badgeBgGradientColor = require('assets/badge_bg_gradient.png')

const alertDesc = `Verida Badge is a public and immutable token sent to your blockchain address. It will appear on your Verida One public profile by default.`

type Status = 'error' | 'success' | undefined

interface ClaimBadgeProps {
  addressList?: WalletItem[]
  chains?: any
  selectedWallet: WalletItem | undefined
  selectedWalletId: string
  onSetSelectedWallet: (selectedWalletID: string) => Promise<void>
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const ClaimBadge: React.FC<ClaimBadgeProps> = ({
  addressList,
  chains,
  selectedWallet,
  selectedWalletId,
  onSetSelectedWallet,
}) => {
  const { data: badgeItem } = useParams<{ data: BadgeType }>()
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const [status, setStatus] = useState<Status>()
  const [modalVisible, setModalVisible] = useState(false)
  const [walletList, setWalletList] = useState<WalletItem[]>([])
  const [estimatedGasFee] = useState('0.001 ETH (1.55 USD)')

  useEffect(() => {
    if (addressList) {
      setWalletList(addressList)
    }
  }, [chains, addressList])

  const handleCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const handleClaimAction = () => {
    setStatus('success')
  }

  const handleWalletSelection = (item: WalletItem) => {
    onSetSelectedWallet(item.id)
    SecureStore.setItemAsync(SELECTED_WALLET_STORAGE_KEY, item.id)
  }

  const selectedAccount = {
    ...selectedWallet,
    onPress: handleCloseModal,
  }

  const handleManageWalletsPress = () => {
    handleCloseModal()
    navigation.navigate('ManageWallets')
  }

  const ModalFooter = (
    <Button
      icon={<SettingsIcon />}
      onPress={handleManageWalletsPress}
      hitSlop={HIT_SLOP}>
      Manage Wallets
    </Button>
  )

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        title={`${badgeItem.label} Badge`}
        left={{ icon: 'back' }}
        showDivider
      />
      {status && (
        <View style={styles.content}>
          <ClaimBadgeStatus type={status} data={badgeItem} />
        </View>
      )}
      {!status && (
        <ScrollView style={styles.content}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={badgeBgGradientColor}
              resizeMode='cover'
              style={styles.bgImage}>
              <Image source={badgeItem.image} style={styles.badgeImage} />
            </ImageBackground>
          </View>
          <View>
            <Text style={styles.title}>{badgeItem.label} Badge</Text>
            <Text style={styles.bodyText}>
              {badgeItem.description}
              {getTruncatedWalletAddress(selectedAccount.address)}
            </Text>
          </View>
          <View style={styles.addressSection}>
            <Text style={styles.addressTitle}>Select address</Text>
            <AddressesListItem
              customStyles={styles.addressList}
              item={selectedAccount}
            />
          </View>
          <View style={styles.alertSection}>
            <AppAlert message={alertDesc} type='warning' />
          </View>
        </ScrollView>
      )}
      {!status && (
        <View style={styles.transactionContainer}>
          <View style={styles.transactionContent}>
            <Text style={styles.trxnText}>Estimated gas fee </Text>
            <Text style={styles.trxnText}>≈ ${estimatedGasFee}</Text>
          </View>
          <Button
            color='primary'
            disabled={false}
            loading={false}
            style={styles.actionButton}
            onPress={handleClaimAction}>
            Claim
          </Button>
        </View>
      )}
      <AppModal
        title='Select Address'
        onClose={handleCloseModal}
        visible={modalVisible}
        footer={ModalFooter}>
        <View style={styles.walletList}>
          <WalletList
            list={walletList}
            leftIconType='checked'
            selectedWalletId={selectedWalletId}
            onPressItem={handleWalletSelection}
          />
        </View>
      </AppModal>
    </SafeAreaView>
  )
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  const network = 'eip155'
  const chains = selectChains(rootState)
  const addressList = getAddressList(state, chains, network)
  return {
    chains,
    addressList,
    selectedWallet: getSelectedAddressById(state, chains, network),
    selectedWalletId: getSelectedWalletId(state),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSetSelectedWallet: (walletID: string) =>
      dispatch(setSelectedWallet(walletID) as any),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClaimBadge)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  imageContainer: {
    marginTop: 15.5,
  },
  bgImage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
  },
  badgeImage: {
    height: 308,
    width: 264,
    marginVertical: 18,
  },
  addressSection: {
    marginVertical: 24,
  },
  alertSection: {
    marginBottom: 24,
  },
  transactionContainer: {
    borderColor: LIGHTGREY_COLOR,
    borderTopWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowColor: `0px 4px 24px rgba(0, 0, 0, 0.04)`,
    padding: 16,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  trxnText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 14,
    color: DARK_GREY_COLOR,
  },
  addressTitle: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 14,
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  title: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '600',
    fontSize: 22,
    textAlign: 'justify',
    color: TEXT_COLOR,
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 12,
    color: DARK_GREY_COLOR,
    marginBottom: 16,
  },
  addressList: {
    elevation: 4,
    borderColor: LIGHTGREY_COLOR,
    borderWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowColor: `0px 4px 24px rgba(0, 0, 0, 0.04)`,
  },
  actionButton: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  walletList: {
    marginTop: 24,
  },
})
