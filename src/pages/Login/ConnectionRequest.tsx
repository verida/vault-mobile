import { Icon } from 'native-base'
import React from 'react'
import { Modal } from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'

interface ConnectionRequestModalProps {
  visible: boolean
  hideModal: () => void
}

export const ConnectionRequestModal: React.FunctionComponent<ConnectionRequestModalProps> =
  (props) => {
    const { hideModal, visible } = props

    return (
      <Modal
        presentationStyle='pageSheet'
        animationType='slide'
        visible={visible}>
        <NavigationHeader
          left={{
            icon: <Icon name='close' style={{ color: '#000' }} />,
            action: () => hideModal(),
          }}
          title='Connection Request'
        />
      </Modal>
    )
  }
