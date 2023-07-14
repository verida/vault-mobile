import { base64 } from 'ethers/lib/utils'
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
    try {
      console.log('handleDeepLink', uri)

      // TODO: handle URI
      const url = new URL(uri)

      // Base64 decode
      Alert.alert(
        'Deeplink',
        JSON.stringify(base64.decode(url.searchParams.get('i_m')!))
      )

      Promise.resolve(true)
    } catch (error) {
      console.error(error)
    }
    Promise.reject('Error handle PolygonID URI')
  }
}
