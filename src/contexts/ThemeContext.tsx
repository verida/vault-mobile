import React from 'react'

import { defaultTheme } from 'styles/theme'
import { Theme } from 'styles/types'

interface ProvidedValue {
  theme: Theme
}

interface Props {
  initial: Theme
  children?: React.ReactNode
}

const Context = React.createContext<ProvidedValue>({
  theme: defaultTheme,
})

export const ThemeProvider = React.memo<Props>((props) => {
  const [theme] = React.useState<Theme>(props.initial)

  return <Context.Provider value={{ theme }}>{props.children}</Context.Provider>
})

export const useTheme = () => React.useContext(Context)
