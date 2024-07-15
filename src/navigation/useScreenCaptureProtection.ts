import { useIsFocused } from '@react-navigation/native'
import * as ScreenCapture from 'expo-screen-capture'
import { useCallback, useEffect } from 'react'

export function useScreenCaptureProtection() {
  const isFocused = useIsFocused()

  const activate = useCallback(async () => {
    await ScreenCapture.preventScreenCaptureAsync()
  }, [])

  const deactivate = useCallback(async () => {
    await ScreenCapture.allowScreenCaptureAsync()
  }, [])

  if (isFocused) {
    activate()
  } else {
    deactivate()
  }

  useEffect(() => {
    return () => {
      deactivate()
    }
  }, [deactivate])
}
