import { Footer } from 'native-base'
import React from 'react'
import { ViewProps } from 'react-native'

import { WHITE_COLOR } from 'constants/color'

const CustomFooter: React.FC<ViewProps> = (props) => {
  const { style, ...rest } = props
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <Footer style={[styles.container, style]} {...rest} />
}

const styles = {
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 15,
    backgroundColor: WHITE_COLOR,
    borderTopWidth: 0,
  },
}

export default CustomFooter
