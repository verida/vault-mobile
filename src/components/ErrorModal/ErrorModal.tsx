import Clipboard from '@react-native-clipboard/clipboard'
import React, { useState } from 'react'
import {
  Dimensions,
  Modal,
  ModalProps,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Text from 'components/Text'
import {
  BLACK_COLOR_OPACITY,
  GREY_COLOR,
  LIGHTGREY_COLOR,
} from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

export type ErrorModalProps = Omit<ModalProps, 'children'> & {
  title: string
  message: string
  details?: ''
  onDismiss: () => void
}

type ErrorDetailsProps = {
  content: string
}

function ErrorDetails(props: ErrorDetailsProps) {
  const { content } = props
  const [isShowing, setIsShowing] = useState(false)

  return (
    <View style={styles.errorDetailsContainer}>
      <TouchableOpacity
        style={styles.errorDetailsToggleButton}
        onPress={() => setIsShowing((_isShowing: boolean) => !_isShowing)}>
        <Text style={styles.showButtonText}>
          {isShowing ? 'Hide details' : 'Show details'}
        </Text>
        {isShowing ? (
          <AntDesign name='caretdown' size={10} color={GREY_COLOR} />
        ) : (
          <AntDesign name='caretright' size={10} color={GREY_COLOR} />
        )}
      </TouchableOpacity>
      {isShowing && (
        <View>
          <ScrollView
            style={styles.errorDetailsScrollView}
            contentContainerStyle={styles.errorDetails}
            bounces={false}>
            <Text>{content}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.copyButton}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            onPress={() => Clipboard.setString(content)}>
            <Ionicons name='md-copy' size={20} color={GREY_COLOR} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

function ErrorModal(props: ErrorModalProps) {
  const { title, message, details, onDismiss, ...rest } = props

  return (
    <Modal {...rest} transparent={true}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {!!details && <ErrorDetails content={details} />}
          <TouchableOpacity style={styles.okButton} onPress={onDismiss}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK_COLOR_OPACITY(0.3),
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  okButton: {
    paddingVertical: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: LIGHTGREY_COLOR,
  },
  okButtonText: {
    fontFamily: NUNITO_SANS_BOLD,
  },
  content: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    overflow: 'hidden',
    maxHeight: 500,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 16,
    marginVertical: 10,
  },
  message: {
    fontSize: 15,
    marginBottom: 10,
  },
  errorDetailsContainer: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorDetailsToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  showButtonText: {
    fontSize: 13,
    marginRight: 5,
  },
  errorDetails: {
    padding: 10,
    backgroundColor: LIGHTGREY_COLOR,
  },
  copyButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  errorDetailsScrollView: {
    maxHeight: SCREEN_WIDTH * 0.7,
  },
})

export default ErrorModal
