import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import BottomActionsModal, {
  BottomActionsModalProps,
} from 'components/BottomActionsModal'
import Text from 'components/Text'
import {
  BLACK_COLOR,
  GREY_COLOR,
  LIGHTGREY_COLOR,
  ORANGE_COLOR,
  PRIMARY_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import AccountsList from 'pages/Dashboard/AccountsList/AccountsList'
import {func} from "prop-types";

export type AddAccountsModalProps = Omit<
  BottomActionsModalProps,
  'children' | 'title' | 'message' | 'footer'
> & {
  onAddNew: () => void
  onImport: () => void
  onSelectAccount: (did: string) => void
  onLogoutAccounts: (dids: string[]) => void
}

// eslint-disable-next-line no-shadow
enum Step {
  INITIAL,
  MANAGE_ACCOUNT,
  CONFIRM_LOGOUT,
  REMIND_SEED_PHRASE,
  ADD_IMPORT,
}

function getTileFromStep(step: Step) {
  switch (step) {
    case Step.INITIAL:
    case Step.ADD_IMPORT:
      return 'Accounts'
    default:
      return 'Log out of selected accounts'
  }
}

function getTitleIconFromStep(step: Step) {
  switch (step) {
    case Step.INITIAL:
    case Step.ADD_IMPORT:
      return (
        <View style={styles.titleIconContainer}>
          <MaterialCommunityIcons
            name='account-multiple'
            size={20}
            color={PRIMARY_COLOR}
          />
        </View>
      )

    default:
      return (
        <View style={styles.titleIconContainer}>
          <Ionicons
            name='ios-warning-outline'
            size={20}
            color={PRIMARY_COLOR}
          />
        </View>
      )
  }
}

function AddAccountsModal(props: AddAccountsModalProps) {
  const {
    onAddNew,
    onImport,
    onSelectAccount,
    onClose,
    onLogoutAccounts,
    ...rest
  } = props
  const [step, setStep] = useState<Step>(Step.INITIAL)
  const [selectedDids, setSelectedDids] = useState<string[]>([])
  const title = getTileFromStep(step)
  const titleIcon = getTitleIconFromStep(step)

  function onPressClose() {
    setStep(0)
    setSelectedDids([])
    onClose()
  }

  function onImportPress() {
    setStep(0)
    onImport()
  }

  function onSelectAccountPress(did: string) {
    if (step === Step.INITIAL) {
      setStep(0)
      onSelectAccount(did)
      return
    }
    const findIndex = selectedDids.indexOf(did)
    if (findIndex !== -1) {
      setSelectedDids((prevState) => [
        ...prevState.slice(0, findIndex),
        ...prevState.slice(findIndex + 1, prevState.length - 1),
      ])
    } else {
      setSelectedDids((prevState) => [...prevState, did])
    }
  }

  function onAddNewPress() {
    setStep(0)
    onAddNew()
  }

  function onLogoutPress() {
    setStep(0)
    onClose()
    onLogoutAccounts(selectedDids)
  }
  
  function onCancelLogout() {
    setStep(Step.INITIAL)
    setSelectedDids([])
  }

  function renderFooter() {
    const logoutDisabled = selectedDids.length === 0
    switch (step) {
      case Step.INITIAL:
        return (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.manageButton]}
              onPress={() => setStep(Step.MANAGE_ACCOUNT)}>
              <Ionicons name='settings-sharp' size={24} color='black' />
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addAccountButton]}
              onPress={() => setStep(Step.ADD_IMPORT)}>
              <AntDesign name='plus' size={17} color='white' />
              <Text style={styles.addAccountButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )
      case Step.ADD_IMPORT:
        return (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.addNewButton]}
              onPress={onAddNewPress}>
              <Text style={styles.addNewButtonText}>Add New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.importButton}
              onPress={onImportPress}>
              <Text style={styles.importButtonText}>Import</Text>
            </TouchableOpacity>
          </View>
        )
      case Step.MANAGE_ACCOUNT:
        return (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.logoutButton,
                logoutDisabled && styles.disabledLogoutButton,
              ]}
              onPress={() => setStep(Step.CONFIRM_LOGOUT)}>
              <MaterialCommunityIcons name='logout' size={17} color='white' />
              <Text style={styles.addAccountButtonText}>Log out</Text>
            </TouchableOpacity>
          </View>
        )

      case Step.CONFIRM_LOGOUT:
        return (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancelLogout}>
              <MaterialCommunityIcons name='logout' size={17} color='white' />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={onLogoutPress}>
              <MaterialCommunityIcons name='logout' size={17} color='white' />
              <Text style={styles.addAccountButtonText}>Log out</Text>
            </TouchableOpacity>
          </View>
        )
    }
  }

  return (
    <BottomActionsModal
      title={title}
      footer={renderFooter()}
      onClose={onPressClose}
      titleIcon={titleIcon}
      {...rest}>
      {step === Step.INITIAL || step === Step.MANAGE_ACCOUNT ? (
        <AccountsList
          onSelectAccount={onSelectAccountPress}
          containerStyle={styles.accountsList}
          selectedDids={selectedDids}
          multipleSelect={step === Step.MANAGE_ACCOUNT}
        />
      ) : (
        <View style={styles.space} />
      )}
    </BottomActionsModal>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAccountButton: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  addAccountButtonText: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 16,
    marginLeft: 10,
  },
  accountsList: {
    marginBottom: 30,
  },
  addNewButton: {
    borderColor: LIGHTGREY_COLOR,
    marginRight: 10,
    flex: 1,
  },
  addNewButtonText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  importButton: {
    backgroundColor: PRIMARY_COLOR,
    flex: 1,
    borderRadius: 4,
    height: 48,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.5,
  },
  importButtonText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  manageButton: {
    flex: 1,
    marginRight: 10,
    borderColor: LIGHTGREY_COLOR,
  },
  manageButtonText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: ORANGE_COLOR,
    borderWidth: 0,
    flex: 1,
  },
  cancelButton: {
    marginRight: 10,
    flex: 1,
  },
  cancelButtonText: {
    color: BLACK_COLOR,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  disabledLogoutButton: {
    backgroundColor: GREY_COLOR,
  },
  titleIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F4FF',
    marginRight: 10,
  },
  space: {
    height: 24,
  },
})

export default AddAccountsModal
