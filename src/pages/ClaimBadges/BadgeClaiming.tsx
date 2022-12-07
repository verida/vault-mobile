import { useActionSheet } from '@expo/react-native-action-sheet'
import React, { useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import EthereumIcon from 'assets/networks/ethereum2.svg'
import PlusIcon from 'assets/plus_icon.svg'
import UnionIcon from 'assets/union_icon.svg'
import AddressesListItem from 'components/AddressesList/AddressesListItem'
import AppAlert from 'components/AppAlert/AppAlert'
import Button from 'components/Button'
import AppModal from 'components/modal/AppModal'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import WalletList from 'components/WalletList'
import { WalletItem } from 'components/WalletList/types'
import AddWalletModal from 'components/WalletModal/AddWalletModal'
import ImportWalletModal from 'components/WalletModal/ImportWalletModal'
import {
  BLACK_COLOR,
  DARK_GREY_COLOR,
  LIGHTGREY_COLOR,
  TEXT_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import ClaimBadgeStatus from 'pages/ClaimBadges/ClaimBadgeStatus'
import { selectChains } from 'reduxStore/tokens/selectors'
import { createNewWallet } from 'reduxStore/wallet/actions'
import { getSelectedWalletId, getWalletList } from 'reduxStore/wallet/selectors'

const VeridaIdentityImage = require('assets/badges_icon/verida_identity.png')

const alertDesc = `Verida Badge is a public and immutable token sent to your blockchain address. It will appear on your Verida One public profile by default.`

type Status = 'error' | 'success' | undefined

interface BadgeClaimingProps {
  wallets?: WalletItem[]
  chains?: any
  selectedWalletId: string
  onCreateNewWallet: (args: unknown) => Promise<void>
  onImportWallet: (args: unknown) => Promise<void>
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const BadgeClaiming: React.FC<BadgeClaimingProps> = ({
  wallets,
  chains,
  onCreateNewWallet,
  selectedWalletId,
  onImportWallet,
}) => {
  const { showActionSheetWithOptions } = useActionSheet()
  const [status, setStatus] = useState<Status>()
  const [modalVisible, setModalVisible] = useState(false)
  const [walletList, setWalletList] = useState<WalletItem[]>([])
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [estimatedGasFee] = useState('0.001 ETH (1.55 USD)')

  useEffect(() => {
    if (wallets) {
      // @Todo: get only list of addresses with it account balance
      setWalletList(wallets)
    }
  }, [chains, wallets])

  const onCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const handleClaimAction = () => {
    setStatus('success')
  }

  const handleWalletSelection = () => {
    //@ Todo: handle wallet Address selection
  }

  const onPressImportWallet = () => {
    onCloseModal()
    setImportModalVisible(true)
  }

  const onPressAddWallet = () => {
    onCloseModal()
    setAddModalVisible(true)
  }

  // @Todo: get selected addresses details from address list
  const mockAddressItem = {
    name: 'Main address 1',
    address: '0xdbcf...67bd',
    amount: '0.0022 ETH',
    icon: <EthereumIcon />,
    onPress: onCloseModal,
  }

  const navigationActionHandler = () => {
    showActionSheetWithOptions(
      {
        options: ['Create new wallet', 'Import a wallet', 'Cancel'],
        icons: [
          <PlusIcon key={'Create new wallet'} />,
          <UnionIcon key={'Import a wallet'} />,
        ],
        tintIcons: false,
        cancelButtonIndex: 2,
        tintColor: BLACK_COLOR,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          onPressAddWallet()
        }
        if (buttonIndex === 1) {
          onPressImportWallet()
        }
      }
    )
  }

  const manageAddress = (
    <Pressable onPress={navigationActionHandler}>
      <PlusIcon />
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader title='Verida Identity Badge' left={{ icon: 'back' }} />
      {status && (
        <View style={styles.content}>
          <ClaimBadgeStatus type={status} />
        </View>
      )}
      {!status && (
        <ScrollView style={styles.content}>
          <View style={styles.imageContainer}>
            <Image source={VeridaIdentityImage} />
          </View>
          <View>
            <Text style={styles.title}>Verida Identity Badge</Text>
            <Text style={styles.bodyText}>
              Your Badge will include your Verida DID as proof of ownership: $
              {mockAddressItem.address}
            </Text>
          </View>
          <View style={styles.addressSection}>
            <Text style={styles.addressTitle}>Select address</Text>
            <AddressesListItem
              customStyles={styles.addressList}
              item={mockAddressItem}
            />
          </View>
          <View style={styles.alertSection}>
            <AppAlert body={alertDesc} type='warning' />
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
        onClose={onCloseModal}
        visible={modalVisible}
        rightIcon={manageAddress}
        customStyles={styles.modalContentStyles}
        footer={<Button hitSlop={HIT_SLOP}>Confirm Selection</Button>}>
        <View style={styles.walletList}>
          <WalletList
            list={walletList}
            leftIconType='checked'
            selectedWalletId={selectedWalletId}
            onPressItem={handleWalletSelection}
          />
        </View>
      </AppModal>
      <ImportWalletModal
        hideModal={() => setImportModalVisible(false)}
        visible={importModalVisible}
        onImportWallet={onImportWallet}
      />
      <AddWalletModal
        hideModal={() => setAddModalVisible(false)}
        visible={addModalVisible}
        onCreateNewWallet={onCreateNewWallet}
      />
    </SafeAreaView>
  )
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  const chains = selectChains(rootState)
  return {
    chains,
    wallets: getWalletList(state, chains),
    selectedWalletId: getSelectedWalletId(state),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onCreateNewWallet: (args: unknown) =>
      dispatch(createNewWallet(args) as any),
    onImportWallet: (args: any) => dispatch(ImportWalletModal(args) as any),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BadgeClaiming)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  imageContainer: {
    marginTop: 15.5,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
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
  modalContentStyles: {
    backgroundColor: WHITE_COLOR,
  },
  walletList: {
    marginTop: 24,
  },
})
