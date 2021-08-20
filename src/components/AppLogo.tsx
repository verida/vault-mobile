import React, { useEffect, useState } from 'react'
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
} from 'react-native'

const CORRECT_SIZE = 80

export type AppLogoProps = Omit<ImageProps, 'source'> & {
  url: string | null
}

function AppLogo(props: AppLogoProps) {
  const { url, style } = props
  const [source, setSource] = useState<ImageSourcePropType>(
    require('assets/placeholder-app-logo.png')
  )

  useEffect(() => {
    if (url) {
      Image.getSize(url, (width, height) => {
        if (width === height) {
          setSource({ uri: url })
        }
      })
    }
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
