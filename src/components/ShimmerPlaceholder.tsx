import { LinearGradient } from 'expo-linear-gradient'
import React, { FC } from 'react'
import OriginalShimmerPlaceholder, {
  ShimmerPlaceholderProps,
} from 'react-native-shimmer-placeholder'

type Props = ShimmerPlaceholderProps

export const ShimmerPlaceholder: FC<Props> = ({ children, ...rest }: Props) => {
  return (
    <OriginalShimmerPlaceholder
      {...rest}
      LinearGradient={LinearGradient}
      location={[0.4, 0.5, 0.6]}
      duration={1000}
      shimmerColors={['#f3f3f3', '#ededed', '#f3f3f3']}>
      {children}
    </OriginalShimmerPlaceholder>
  )
}
