import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Linking, ScrollView, StyleSheet, View } from 'react-native'

import Texture from '~/assets/landing-bg.svg'
import Logo from '~/assets/logo.svg'
import Button from '~/components/Button'
import Text from '~/components/Text'
import { WHITE_COLOR } from '~/constants/color'
import { CONFUSED_FACE } from '~/constants/strings'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import { MaintenanceMode } from '~/features/config'

interface Props {
  maintenanceMode: MaintenanceMode
}

export const MaintenanceScreen: React.FC<Props> = ({ maintenanceMode }) => {
  const title = CONFUSED_FACE
  const shutDownTitle =
    'The Verida Wallet is currently in maintenance. Sorry for the inconvenience.'
  const furtherInfoLink = maintenanceMode.link || 'https://news.verida.io/'

  return (
    <LinearGradient
      colors={['#0E1572', '#1467CB', '#1995CB']}
      style={style.landing}>
      <Texture width={425} height={428} />
      <View style={style.positionAbsolute}>
        <ScrollView>
          <Logo width={156} height={52} />
          <Text style={style.title}>{title}</Text>
          <Text style={style.subTitle}>{shutDownTitle}</Text>
          {Boolean(maintenanceMode.message) && (
            <Text
              style={
                style.subTitle
              }>{`Reason: ${maintenanceMode.message}`}</Text>
          )}
          <Text style={style.subTitle2}>
            {`Expected end time: ${
              maintenanceMode.expectedEndTime
                ? new Date(maintenanceMode.expectedEndTime)
                : 'Unknown'
            }`}
          </Text>
        </ScrollView>
        <View>
          <Button
            color='secondary'
            onPress={() =>
              Linking.canOpenURL(furtherInfoLink).then(() =>
                Linking.openURL(furtherInfoLink)
              )
            }>
            Further Info
          </Button>
        </View>
      </View>
    </LinearGradient>
  )
}

const style = StyleSheet.create({
  positionAbsolute: {
    position: 'absolute',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
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
    marginTop: '35%',
  },
  subTitle: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 18,
    marginTop: 32,
  },

  subTitle2: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 18,
    marginTop: 12,
  },
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  modal: {
    backgroundColor: '#FDF4EA',
    paddingLeft: 15,
    marginTop: 10,
    width: '100%',
    borderRadius: 5,
  },
})
