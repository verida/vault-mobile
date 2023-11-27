import { ProtocolsContext } from 'features/protocols/contexts'
import { useContext } from 'react'

export function useProtocols() {
  const contextValue = useContext(ProtocolsContext)
  if (contextValue === null) {
    throw new Error('useProtocols must be used within a <ProtocolsProvider>')
  }
  return contextValue
}
