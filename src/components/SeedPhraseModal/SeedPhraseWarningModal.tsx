import React, { useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

import AlertIconSvg from '~/assets/alert_icon.svg'
import CheckboxCheckedSvg from '~/assets/checkbox_checked.svg'
import CheckboxSvg from '~/assets/checkbox_unchecked.svg'
import PrivateKeySvg from '~/assets/private_key_illustration.svg'
import SeedPhraseSvg from '~/assets/seed_phrase_illustration.svg'
import Button from '~/components/Button'
import Layout from '~/components/Layouts/Layout'
import NavigationHeader from '~/components/Navigation/NavigationHeader'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD } from '~/constants/text'
import CloseIcon from '~assets/icons/close_icon.svg'

const modalContent = {
  seed_phrase: {
    title: 'Seed Phrase',
    image: <SeedPhraseSvg />,
    content: [
      <Text key='bullet_point_1'>
        Seed phrase is
        <Text
          style={{
            fontFamily: NUNITO_SANS_BOLD,
          }}>
          {` the only way to recover access to your account `}
        </Text>
        if your phone is lost, stolen, broken or upgraded.
      </Text>,
      <Text key='bullet_point_2'>
        <Text
          style={{
            fontFamily: NUNITO_SANS_BOLD,
          }}>
          Never share it with anyone.
        </Text>{' '}
        Verida will never ask you to share your seed phrase.
      </Text>,
    ],
    buttonLabel: 'Show Seed Phrase',
  },
  private_key: {
    title: 'Private Key',
    image: <PrivateKeySvg />,
    content: [
      <Text key='bullet_point_1'>
        Private key is
        <Text
          style={{
            fontFamily: NUNITO_SANS_BOLD,
          }}>
          {` the only way to recover access to your account `}
        </Text>
        if your phone is lost, stolen, broken or upgraded.
      </Text>,
      <Text key='bullet_point_2'>
        <Text
          style={{
            fontFamily: NUNITO_SANS_BOLD,
          }}>
          Never share it with anyone.
        </Text>{' '}
        Verida will never ask you to share your seed phrase.
      </Text>,
    ],
    buttonLabel: 'Show Private Key',
  },
}

type Props = {
  hideModal: () => void
  visible: boolean
  onPressButton: () => void
  type: keyof typeof modalContent
}

export default (props: Props) => {
  const { visible, hideModal, type, onPressButton } = props
  const [checkbox, setCheckboxState] = useState(false)

  return (
    <Modal
      presentationStyle='pageSheet'
      animationType='slide'
      visible={visible}>
      <NavigationHeader
        left={{
          icon: <CloseIcon />,
          action: () => hideModal(),
        }}
        title={modalContent[type].title}
      />
      <Layout style={styles.container}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>{modalContent[type].image}</View>
          <View>
            {modalContent[type].content.map((item, index) => (
              <View
                style={styles.bulletListItem}
                key={`bullet_point_${type}_${index}`}>
                <AlertIconSvg style={styles.alertIcon} />
                {item}
              </View>
            ))}
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => setCheckboxState(!checkbox)}
            style={styles.checkbox}>
            {checkbox ? <CheckboxCheckedSvg /> : <CheckboxSvg />}
            <Text style={styles.checkboxLabel}>I understand the risks</Text>
          </TouchableOpacity>
          <Button
            color='primary'
            disabled={!checkbox}
            onPress={() => onPressButton()}>
            {modalContent[type].buttonLabel}
          </Button>
        </View>
      </Layout>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
    marginHorizontal: 30,
  },
  imageContainer: { marginBottom: 50 },
  bulletListItem: {
    flexDirection: 'row',
    marginBottom: 22,
    marginRight: 35,
  },
  alertIcon: {
    marginRight: 15,
  },
  checkbox: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 15,
  },
})
