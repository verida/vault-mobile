import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from 'contexts/ThemeContext'
import React, { useCallback, useEffect, useState } from 'react'
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
import { ClaimableBadgeParams } from 'types/badges'
import { WalletItem } from 'types/wallet'
import { getTruncatedWalletAddress } from 'wallet/helpers/tokens'

import SettingsIcon from 'assets/settings_icon.svg'
import AddressesListItem from 'components/AddressesList/AddressesListItem'
import AppAlert from 'components/AppAlert/AppAlert'
import Button from 'components/Button'
import AppModal from 'components/modal/AppModal'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import WalletList from 'components/WalletList'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackParams } from 'navigation/types'
import ClaimBadgeStatus from 'pages/ClaimBadges/ClaimBadgeStatus'
import { selectChains } from 'reduxStore/tokens/selectors'
import { setSelectedWallet } from 'reduxStore/wallet/actions'
import { getAddressList } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

const badgeBgGradientColor = require('assets/badge_gradient_bg.png')

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

const ClaimBadge: React.FC<ClaimBadgeProps> = ({ addressList, chains }) => {
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const { data: badgeItem } = useParams<{ data: ClaimableBadgeParams }>()
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const [status, setStatus] = useState<Status>()
  const [selectedID, setSelectedID] = useState('')
  const [sAccount, setSAccount] = useState<WalletItem>()
  const [modalVisible, setModalVisible] = useState(false)
  const [walletList, setWalletList] = useState<WalletItem[]>([])
  // TODO: get estimated gas fee from an api for blockchain operations.
  const [estimatedGasFee] = useState('0.001 ETH (1.55 USD)')

  const handleSelectedAccountState = useCallback((item: WalletItem) => {
    setSelectedID(item.id)
    setSAccount(item)
  }, [])

  useEffect(() => {
    if (addressList?.length) {
      setWalletList(addressList)
      handleSelectedAccountState(addressList[0])
    }
  }, [chains, addressList, handleSelectedAccountState])

  const handleCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const handleClaimAction = () => {
    setStatus('success')
  }

  const handleWalletSelection = (item: WalletItem) => {
    const selectedWallet = walletList.find(
      (wallet) => wallet.id === item.id
    ) as WalletItem
    handleCloseModal()
    handleSelectedAccountState(selectedWallet)
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
        title={`${badgeItem.name} Badge`}
        left={{ icon: 'back' }}
      />
      {status && (
        <View style={styles.content}>
          <ClaimBadgeStatus status={status} badgeInfo={badgeItem} />
        </View>
      )}
      {!status && (
        <ScrollView style={styles.content}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={badgeBgGradientColor}
              resizeMode='cover'
              imageStyle={{
                borderRadius: theme.borderRadius.l,
              }}
              style={styles.bgImage}>
              <Image source={badgeItem.image} style={styles.badgeImage} />
            </ImageBackground>
          </View>
          <View>
            <Text style={styles.title}>{badgeItem.name} Badge</Text>
            <Text style={styles.bodyText}>
              {badgeItem.description}
              {getTruncatedWalletAddress(badgeItem.proof)}
            </Text>
          </View>
          <View style={styles.addressSection}>
            <Text style={styles.addressTitle}>Select address</Text>
            {sAccount && (
              <AddressesListItem
                onPress={handleCloseModal}
                customStyles={styles.addressList}
                item={sAccount}
              />
            )}
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
            selectedWalletId={selectedID}
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
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSetSelectedWallet: (walletID: string) =>
      dispatch(setSelectedWallet(walletID) as any),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClaimBadge) as any

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    imageContainer: {
      position: 'relative',
      marginTop: 15.5,
    },
    bgImage: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      marginHorizontal: theme.spacing.m,
    },
    badgeImage: {
      height: 308,
      width: 264,
      marginVertical: 18,
    },
    addressSection: {
      marginVertical: theme.spacing.l,
    },
    alertSection: {
      marginBottom: theme.spacing.l,
    },
    transactionContainer: {
      borderColor: theme.color.lightGrey,
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
      fontSize: theme.fontSize.m,
      color: theme.color.grey400,
    },
    addressTitle: {
      fontFamily: NUNITO_SANS,
      fontWeight: '600',
      fontSize: theme.fontSize.m,
      color: theme.color.primary100,
      marginBottom: theme.spacing.s,
    },
    title: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontWeight: '600',
      fontSize: 22,
      textAlign: 'justify',
      color: theme.color.primary100,
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.s,
    },
    bodyText: {
      fontFamily: NUNITO_SANS,
      fontWeight: '600',
      fontSize: theme.fontSize.s,
      color: theme.color.grey400,
      marginBottom: theme.spacing.m,
    },
    addressList: {
      elevation: 4,
      borderColor: theme.color.lightGrey,
      borderWidth: 1,
      shadowOpacity: 1,
      shadowRadius: theme.borderRadius.xs,
      shadowOffset: { height: 4, width: 0 },
      shadowColor: `0px 4px 24px rgba(0, 0, 0, 0.04)`,
    },
    actionButton: {
      fontSize: theme.fontSize.s,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    walletList: {
      marginTop: theme.spacing.l,
    },
  })
}
