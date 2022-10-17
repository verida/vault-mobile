import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import Texture from 'assets/landing-bg.svg'
import Logo from 'assets/logo.svg'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import { WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'

import Button from '../../components/Button'

const title = 'Delete Account'
const info =
  'To delete your account, please remove any record of your recovery passphrase then logout of this application. \n\n' +
  'Please note that this operation is final - Verida has no access to your data and cannot recover your account without that passphrase.'

const DeleteAccount = () => {
  const navigation = useNavigation()
  const params = useParams<{
    onSelectAccount?: (did: string) => void
    onLogoutAccounts?: (dids: string[]) => void
  }>()
  const [showLogout, setShowLogout] = useState(false)

  return (
    <LinearGradient
      colors={['#0E1572', '#1467CB', '#1995CB']}
      style={style.landing}>
      <Texture width={425} height={428} />
      <View style={style.positionAbsolute}>
        <View>
          <Logo width={139} height={51} />
          <Text style={style.title}>{title}</Text>
          <Text style={style.subTitle}>{info}</Text>
        </View>
        <Spacer height={48} />
        <View>
          <Button
            color='warning'
            onPress={() => {
              setShowLogout(true)
            }}>
            Log Out
          </Button>

          <Button
            color='secondary'
            onPress={() => {
              navigation.goBack()
            }}>
            Go Back
          </Button>
        </View>
      </View>
      <AddAccountsModal
        visible={showLogout}
        onClose={() => {
          setShowLogout(false)
        }}
        showLogout
        onSelectAccount={params.onSelectAccount}
        onLogoutAccounts={params.onLogoutAccounts}
      />
    </LinearGradient>
  )
}

const style = StyleSheet.create({
  positionAbsolute: {
    position: 'absolute',
    paddingHorizontal: 24,
    paddingVertical: 77,
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  landing: {
    flex: 1,
  },
  title: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 36,
    marginTop: '25%',
  },
  subTitle: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 18,
    textAlign: 'justify',
    marginTop: '15%',
  },
})

export default DeleteAccount
