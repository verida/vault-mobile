import React from 'react'

import { useTheme } from '~/contexts/ThemeContext'
import { Theme } from '~/styles/types'

type Generator<T extends Record<string, unknown>> = (theme: Theme) => T

const useThemeAwareStyle = <T extends Record<string, unknown>>(
  fn: Generator<T>
) => {
  const { theme } = useTheme()
  const ThemeAwareStyle = React.useMemo(() => fn(theme), [fn, theme])
  return ThemeAwareStyle
}
export { useThemeAwareStyle }
