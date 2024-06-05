import { Content } from 'native-base'
import React from 'react'
import { ViewProps } from 'react-native'

import { WHITE_COLOR } from '~/constants/color'

/**
 * @deprecated use <ScreenWrapper> instead
 */
const CustomContent: React.FC<ViewProps> = (props) => {
  const { style, ...rest } = props
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <Content contentContainerStyle={[styles.container, style]} {...rest} />
}

const styles = {
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 15,
    backgroundColor: WHITE_COLOR,
  },
}

export default CustomContent
