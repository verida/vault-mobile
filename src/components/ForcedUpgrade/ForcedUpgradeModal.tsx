import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Linking, Modal, ScrollView, StyleSheet, View } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { SafeAreaView } from 'react-native-safe-area-context'

import Texture from 'assets/landing-bg.svg'
import Logo from 'assets/logo.svg'
import Button from 'components/Button'
import { Spacer } from 'components/Spacer'
import { Paragraph } from 'components/Typography/Paragraph'
import { Title } from 'components/Typography/Title'
import { useForcedUpgrade } from 'hooks/useForcedUpgrade'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

type Props = {
  dismissModal: () => void
}

const ForcedUpgradeModal = (_: Props) => {
  const { forcedUpgrade } = useForcedUpgrade()
  const styles = useThemeAwareStyle(createStyles)

  const onDownloadPress = () => {
    Linking.canOpenURL(forcedUpgrade.storeUrl!)
      .then(() => {
        Linking.openURL(forcedUpgrade.storeUrl!)
      })
      .catch()
  }

  const onFurtherInfoPress = () => {
    Linking.canOpenURL(forcedUpgrade.furtherInfo!)
      .then(() => {
        Linking.openURL(forcedUpgrade.furtherInfo!)
      })
      .catch()
  }

  return (
    <Modal animationType='fade' transparent visible>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#0E1572', '#1467CB', '#1995CB']}
          style={styles.landing}>
          <Texture width={425} height={428} />
          <View style={styles.backgroundContainer}>
            <View>
              <Logo width={139} height={51} />
              {/* <Text style={style.title}>{title}</Text> */}
            </View>
          </View>
        </LinearGradient>
        <View style={styles.container}>
          <View style={styles.card}>
            <Title style={styles.title}>Update Required</Title>
            <Spacer vertical='m' />
            <View style={styles.hline} />
            <Spacer vertical='m' />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <Paragraph>{forcedUpgrade?.message ?? ''}</Paragraph>
              <Spacer vertical='l' />
              <Paragraph>Current version: {getVersion()}</Paragraph>
              <Paragraph>
                Minimum required version: {forcedUpgrade?.minVersion}
              </Paragraph>
            </ScrollView>
            <View style={styles.footer}>
              <Button color='primary' onPress={onDownloadPress}>
                Download
              </Button>
              <Button color='grey' onPress={onFurtherInfoPress}>
                Further Info
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ForcedUpgradeModal

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: '10%',
      paddingVertical: '20%',
      backgroundColor: theme.color.overlay,
    },
    card: {
      backgroundColor: theme.color.surface,
      borderRadius: 20,
      width: '100%',
      minHeight: '60%',
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    scrollViewContainer: {
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.m,
    },
    title: {
      paddingHorizontal: theme.spacing.m,
      marginTop: theme.spacing.m,
    },
    hline: {
      height: StyleSheet.hairlineWidth,
      width: '100%',
      backgroundColor: theme.color.separator,
    },
    footer: {
      backgroundColor: theme.color.surface,
      width: '100%',

      padding: theme.spacing.m,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    landing: { ...StyleSheet.absoluteFillObject },
    backgroundContainer: {
      position: 'absolute',
      paddingHorizontal: 24,
      paddingVertical: 77,
      height: '100%',
      width: '100%',
      justifyContent: 'space-between',
    },
  })
}
