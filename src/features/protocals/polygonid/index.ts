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
    console.log('handleDeepLink', uri)
    Alert.alert('Deeplink', uri)
    // TODO: handle URI
    const url = new URL(uri)
    console.log('url params: i_m =', url.searchParams.get('i_m'))
    // Base64 decode
    // base64.decode(url.searchParams.get('i_m'))

    Promise.resolve(true)
  }
}
