import React, { useCallback } from 'react'

type IdentityDrawerContextType = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const IdentityDrawerContext =
  React.createContext<IdentityDrawerContextType | null>(null)

export const IdentityDrawerProvider: React.FunctionComponent<{
  children: React.ReactNode
}> = (props) => {
  const { children } = props
  const [isOpen, setIsOpen] = React.useState<boolean>(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prevIsOpen) => !prevIsOpen), [])

  const contextValue = { isOpen, open, close, toggle }

  return (
    <IdentityDrawerContext.Provider value={contextValue}>
      {children}
    </IdentityDrawerContext.Provider>
  )
}
