import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
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
import { AvailableBadge } from 'types/badges'
import { WalletItem } from 'types/wallet'

import { BadgeManager } from 'api/BadgeManager'
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
import { getAddressList } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

const badgeBackgroundImage = require('assets/badge_gradient_bg.png')

const alertDesc = `Verida Badge is a public and immutable token sent to your blockchain address. It will appear on your Verida One public profile by default.`

type Status = 'error' | 'success' | undefined

interface ClaimBadgeProps {
  addressList: WalletItem[]
  defaultSelectedAddress?: WalletItem
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const ClaimBadge: React.FC<ClaimBadgeProps> = ({
  addressList,
  defaultSelectedAddress,
}) => {
  const styles = useThemeAwareStyle(createStyles)
  const { badge } = useParams<{ badge: AvailableBadge }>()
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const [status, setStatus] = useState<Status>()
  const [selectedAddress, setSelectedAddress] = useState<
    WalletItem | undefined
  >(defaultSelectedAddress)
  const [modalVisible, setModalVisible] = useState(false)
  // TODO: get estimated gas fee from an api for blockchain operations.
  const [estimatedGasFee] = useState('0.001 ETH (1.55 USD)')

  // TODO: Handle no data returned. ie: not connected or error

  // Have an explicit 'open' and 'close' callback to avoid unsync issue
  const handleOpenModal = () => {
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  const handleClaimAction = async () => {
    try {
      await BadgeManager.claimBadge(badge.origin, badge.type)
      setStatus('success')
    } catch (err) {
      // @todo: catch error and display error message to the user
      console.log(err.message)
    }
  }

  const handleAddressSelection = (selection: WalletItem) => {
    const address = addressList.find(
      (item) => item.id === selection.id
    ) as WalletItem
    handleCloseModal()
    setSelectedAddress(address)
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
        title={`${badge.label} Badge`}
        left={{ icon: 'back' }}
      />
      {status && (
        <View style={styles.content}>
          <ClaimBadgeStatus status={status} badgeInfo={badge} />
        </View>
      )}
      {!status && (
        <ScrollView style={styles.content}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={badgeBackgroundImage}
              resizeMode='cover'
              imageStyle={styles.badgeImageBackground}
              style={styles.badgeImageBackgroundContainer}>
              <Image src={badge.imageUrl} style={styles.badgeImage} />
            </ImageBackground>
          </View>
          <View>
            <Text style={styles.title}>{badge.label} Badge</Text>
            <Text style={styles.bodyText}>
              {`${badge.description}: ${
                badge?.claimMetadata || 'Not connected'
              }`}
            </Text>
          </View>
          <View style={styles.addressSection}>
            <Text style={styles.addressTitle}>Select address</Text>
            {selectedAddress && (
              <AddressesListItem
                // FIXME: Create a dedicated component, not a list item
                // FIXME: Allow undefined address
                onPress={handleOpenModal}
                customStyles={styles.addressListItem}
                item={selectedAddress}
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
        <View style={styles.addressList}>
          <WalletList
            //FIXME: Need a dedicated component for addresses, not wallets
            // FIXME: Allow empty selection
            list={addressList}
            leftIconType='checked'
            selectedWalletId={selectedAddress?.id || ''}
            onPressItem={handleAddressSelection}
          />
        </View>
      </AppModal>
    </SafeAreaView>
  )
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  const network = 'eip155'
  // TODO: Define the list of supported network somewhere appropriate
  const chains = selectChains(rootState)
  const addressList = getAddressList(state, chains, network)
  // TODO: Allow getting addresses from a list of networks, not just one
  // TODO: Is network the right word?
  const defaultSelectedAddress =
    addressList.length > 0 ? addressList[0] : undefined
  // TODO: Find a better way to get the default address, maybe from the currently selected wallet.
  return {
    addressList,
    defaultSelectedAddress,
  }
}

export default connect(mapStateToProps)(ClaimBadge) as any

// TODO: Rework the sizing of the image. Maybe create a dedicated component
const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.m,
    },
    imageContainer: {
      position: 'relative',
    },
    badgeImageBackgroundContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeImageBackground: {
      borderRadius: theme.borderRadius.l,
      borderWidth: 1,
      borderColor: theme.color.lightGrey,
    },
    badgeImage: {
      height: 308,
      width: 264,
      margin: 18,
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
      paddingTop: 12,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    transactionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
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
      fontWeight: '700',
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
    addressListItem: {
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
    addressList: {
      marginTop: theme.spacing.l,
    },
  })
}
