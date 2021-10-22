import { StyleSheet, TouchableOpacity, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Text from 'components/Text'
import BottomActionsModal, {
  BottomActionsModalProps,
} from 'components/BottomActionsModal'
import React, { useState } from 'react'
import { LIGHTGREY_COLOR, PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import AccountsList from 'pages/Dashboard/AccountsList/AccountsList'

export type AddAccountsModalProps = Omit<
  BottomActionsModalProps,
  'children' | 'title' | 'message' | 'footer'
> & {
  onAddNew: () => void
  onImport: () => void
  onSelectAccount: (did: string) => void
}

function AddAccountsModal(props: AddAccountsModalProps) {
  const { onAddNew, onImport, onSelectAccount, onClose, ...rest } = props
  const [showNextStep, setShowNextStep] = useState(false)

  function onPressClose() {
    setShowNextStep(false)
    onClose()
  }

  function onImportPress() {
    setShowNextStep(false)
    onImport()
  }

  function onSelectAccountPress(did: string) {
    setShowNextStep(false)
    onSelectAccount(did)
  }

  function onAddNewPress() {
    setShowNextStep(false)
    onAddNew()
  }

  return (
    <BottomActionsModal
      title={'Accounts'}
      footer={
        showNextStep ? (
          <View style={styles.nextStepButtons}>
            <TouchableOpacity
              style={[styles.button, styles.addNewButton]}
              onPress={onAddNewPress}>
              <Text style={styles.addNewButtonText}>Add New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.importButton}
              onPress={onImportPress}
              disabled={true}>
              <Text style={styles.importButtonText}>Import</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.addAccountButton]}
            onPress={() => setShowNextStep(true)}>
            <AntDesign name='plus' size={17} color='black' />
            <Text style={styles.addAccountButtonText}>Add Account</Text>
          </TouchableOpacity>
        )
      }
      onClose={onPressClose}
      {...rest}>
      {!showNextStep && (
        <AccountsList
          onSelectAccount={onSelectAccountPress}
          containerStyle={styles.accountsList}
        />
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
    borderColor: LIGHTGREY_COLOR,
  },
  addAccountButtonText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 16,
    marginLeft: 10,
  },
  accountsList: {
    marginBottom: 30,
  },
  nextStepButtons: {
    flexDirection: 'row',
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
})

export default AddAccountsModal
