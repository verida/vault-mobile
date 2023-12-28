import { useTheme } from 'contexts/ThemeContext'
import React from 'react'

import { Theme } from 'styles/types'

type Generator<T extends Record<string, unknown>> = (theme: Theme) => T

// TODO: Move this useThemeAwareStyle in the styles/hooks folder
const useThemeAwareStyle = <T extends Record<string, unknown>>(
  fn: Generator<T>
) => {
  const { theme } = useTheme()
  const ThemeAwareStyle = React.useMemo(() => fn(theme), [fn, theme])
  return ThemeAwareStyle
}
export { useThemeAwareStyle }
