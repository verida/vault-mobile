import Text from 'components/Text'
import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { ORANGE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { setShowSeedPhraseReminder } from 'reduxStore/general/actions'
import AccountManager from 'api/AccountManager'
import { useDispatch, useSelector } from 'react-redux'

export type SeedPhraseRemindViewProps = Omit<ViewProps, 'children'> & {
  onRecordPress: () => void
}
const REMIND_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

function SeedPhraseRemindView(props: SeedPhraseRemindViewProps) {
  const { onRecordPress, style, ...rest } = props

  const dispatch = useDispatch()
  const selectedAccount = useSelector((state: any) => state.selectedAccount)
  const showSeedPhraseReminder = useSelector(
    (state: any) => state.showSeedPhraseReminder
  )

  useEffect(() => {
    async function checkReminder() {
      if (selectedAccount?.seedPhraseReminder?.backedup) {
        dispatch(setShowSeedPhraseReminder(false))
        return
      }

      const expired =
        Date.now() - (selectedAccount?.seedPhraseReminder?.lastTime || 0) >
        REMIND_EXPIRATION_TIME
      console.log('expired:', expired)
      if (!selectedAccount?.seedPhraseReminder || expired) {
        dispatch(setShowSeedPhraseReminder(true))
        await AccountManager.getInstance().updateLastTimeSeedPhraseReminder(
          false
        )
      }
    }

    checkReminder()
  }, [selectedAccount, dispatch])

  if (!showSeedPhraseReminder) {
    return null
  }

  function onClosePress() {
    dispatch(setShowSeedPhraseReminder(false))
  }

  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.header}>
        <AntDesign name='exclamationcircleo' size={16} color={ORANGE_COLOR} />
        <Text style={styles.title}>Record Your Seed Phrase</Text>
        <TouchableOpacity
          onPress={onClosePress}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
          <AntDesign name='close' size={16} color='black' />
        </TouchableOpacity>
      </View>
      <Text style={styles.message}>
        You have not recorded your seed phrase. Record it now to create a backup
        for your account.{' '}
        <TouchableOpacity
          style={styles.recordButton}
          hitSlop={{ top: 10, left: 0, right: 0, bottom: 10 }}
          onPress={onRecordPress}>
          <Text style={styles.recordButtonText}>Record Now</Text>
        </TouchableOpacity>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 15,
    alignItems: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: ORANGE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
  },
  message: {
    fontSize: 12,
  },
  recordButtonText: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 12,
    includeFontPadding: false,
    textDecorationLine: 'underline',
  },
  recordButton: {},
})

export default SeedPhraseRemindView
