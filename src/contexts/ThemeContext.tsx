import React from 'react'

import { defaultTheme } from 'styles/theme'
import { Theme } from 'styles/types'

// TODO: Move this ThemeContext in the styles/contexts folder

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

// TODO: Move this useTheme in the styles/hooks folder
export const useTheme = () => React.useContext(Context)
