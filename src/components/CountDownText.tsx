import React, { useEffect, useState } from 'react'
import { TextProps } from 'react-native'

import Text from './Text'

export interface CountDownTextProps extends TextProps {
  seconds: number
  onFinish: () => void
}

function CountDownText(props: CountDownTextProps) {
  const { seconds, onFinish, ...rest } = props
  const [remainingTime, setRemainingTime] = useState<number>(seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prevState) => Math.max(0, prevState - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (remainingTime === 0) {
      onFinish()
    }
  }, [onFinish, remainingTime])

  return <Text {...rest}>{remainingTime}</Text>
}

export default CountDownText
