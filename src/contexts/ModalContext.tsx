import React, { createContext, ReactNode, useCallback } from 'react'

export const ModalContext = createContext<ReturnType<typeof useModal>>(
  null as any
)

function useModal() {
  const [modal, setModal] = React.useState<ReactNode>(null)
  const onDismiss = useCallback(() => {
    setModal(null)
  }, [])
  const showModal = useCallback((openModal: ReactNode) => {
    setModal(openModal)
  }, [])

  return {
    onDismiss,
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
