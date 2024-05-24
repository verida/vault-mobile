import * as Font from 'expo-font'
import { useCallback } from 'react'

export function useFonts() {
  const loadFonts = useCallback(async () => {
    // Not sure why it is in a hook, has to be?
    const NunitoSans = require('assets/fonts/NunitoSans-Regular.ttf')
    const NunitoSansSemiBold = require('assets/fonts/NunitoSans-SemiBold.ttf')
    const NunitoSansBold = require('assets/fonts/NunitoSans-Bold.ttf')

    await Promise.all([
      Font.loadAsync({ NunitoSans }),
      Font.loadAsync({ NunitoSansSemiBold }),
      Font.loadAsync({ NunitoSansBold }),
    ])
  }, [])

  return {
    loadFonts,
  }
}
