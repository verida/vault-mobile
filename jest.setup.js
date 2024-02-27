import { generateMock } from '@anatine/zod-mock'
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock'

import { EnvVarsSchema } from './src/features/config'

jest.mock('react-native-blob-util', () => {
  return {
    android: {
      actionViewIntent: jest.fn(),
    },
    ios: {
      openDocument: jest.fn(),
      previewDocument: jest.fn(),
    },
    config: jest.fn(),
    fs: {
      dirs: {
        DocumentDir: 'yourdocumentdir',
        DownloadDir: 'yourdownloadsdir',
        MainBundleDir: 'MainBundleDir',
      },
    },
  }
})

jest.mock('react-native-device-info', () => mockRNDeviceInfo)

const configData = generateMock(EnvVarsSchema)
console.log('configData', configData)
// jest.mock('react-native-config', () => configData)
