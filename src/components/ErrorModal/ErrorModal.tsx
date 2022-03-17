import React from 'react'
import { Modal, ModalProps, StyleSheet, View } from 'react-native'

import Text from 'components/Text'

export type ErrorModalProps = Omit<ModalProps, 'children'> & {
  title: string
  message: string
  details?: any[]
  onDismiss: () => void
}

type ErrorDetailsProps = {
  content: any[]
}

function ErrorDetails(props: ErrorDetailsProps) {
  const { content } = props

  return <Text>{content}</Text>
}

function ErrorModal(props: ErrorModalProps) {
  const { title, message, details, onDismiss, ...rest } = props

  return (
    <Modal {...rest}>
      <View style={styles.container}>
        <Text>{title}</Text>
        <Text>{message}</Text>
        {details && <ErrorDetails content={details} />}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
})

export default ErrorModal
