import React, { createContext, ReactNode, useCallback } from 'react'

export const ModalContext = createContext<ReturnType<typeof useModal>>(
  null as any
)

// TODO: Move this inside the Provider. For the size of it, it's no big deal, but its name is confusing with the other useModal
function useModal() {
  const [modal, setModal] = React.useState<ReactNode>(null)
  const dismissModal = useCallback(() => {
    setModal(null)
  }, [])
  const showModal = useCallback((openModal: ReactNode) => {
    setModal(openModal)
  }, [])

  return {
    dismissModal,
    modal,
    showModal,
    isOpen: !!modal,
  }
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const modalProps = useModal()
  return (
    <ModalContext.Provider value={modalProps}>
      {children}
      {modalProps.modal && modalProps.modal}
    </ModalContext.Provider>
  )
}
