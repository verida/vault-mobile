import LottieView from 'lottie-react-native'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

export type LoadingViewProps = Omit<ViewProps, 'children'> & {
  type?: 'big' | 'small'
}

function LoadingView(props: LoadingViewProps) {
  const { style, type = 'big' } = props

  const source =
    type === 'big'
      ? require('~/assets/animations/loading.json')
      : require('~/assets/animations/loading-small-dark.json')
  const lottieViewStyle =
    type === 'big' ? styles.loadingView : styles.loadingViewSmall
  return (
    <View style={[styles.container, style]}>
      <LottieView source={source} autoPlay loop style={lottieViewStyle} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingView: {
    width: 200,
    height: 200,
  },
  loadingViewSmall: {
    width: 50,
    height: 50,
  },
})

export default LoadingView
