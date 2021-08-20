import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import LottieView from 'lottie-react-native'

export type LoadingViewProps = Omit<ViewProps, 'children'>

function LoadingView(props: LoadingViewProps) {
  const { style } = props

  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={require('assets/animations/loading.json')}
        autoPlay
        loop
        style={styles.loadingView}
      />
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
})

export default LoadingView
