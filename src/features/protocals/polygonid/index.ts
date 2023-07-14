import { Alert } from 'react-native'

import { ProtocolHandler } from '../@types'

export class PolygonIdProtocalHandler implements ProtocolHandler {
  identifier(): string | undefined {
    return 'polygonid'
  }
  handleQRCode(qrCodeMessage: string): Promise<boolean> {
    console.log('handleQRCode', qrCodeMessage)
    throw new Error('Method not implemented.')
  }

  handleDeepLink(uri: string): Promise<boolean> {
    console.log('handleDeepLink', uri)
    Alert.alert('Deeplink', uri)

    // TODO: handle URI

    Promise.resolve(true)
  }
}
