import React, { useEffect, useState } from 'react'
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
} from 'react-native'

const CORRECT_SIZE = 120

export type AppLogoProps = Omit<ImageProps, 'source'> & {
  url: string | null // TODO: Use undefined instead of null, so it can be used in Image directly
}

// TODO: Change the default logo asset by something more subtle and generic

function AppLogo(props: AppLogoProps) {
  const { url, style } = props
  const [source, setSource] = useState<ImageSourcePropType>(
    require('assets/placeholder-app-logo.png')
  )

  useEffect(() => {
    if (!url) {
      return
    }
    setSource({ uri: url })
    // TODO: Find a better to handle non-square images
    // Image.getSize(url, (width, height) => {
    //   if (width === height) {
    //     setSource({ uri: url })
    //   }
    // })
  }, [url])

  return (
    <Image
      source={source}
      defaultSource={require('assets/placeholder-app-logo.png')}
      style={[styles.image, style]}
    />
  )
}

const styles = StyleSheet.create({
  image: {
    width: CORRECT_SIZE,
    height: CORRECT_SIZE,
    resizeMode: 'contain',
  },
})

export default AppLogo
