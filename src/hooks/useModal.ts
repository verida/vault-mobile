import { ModalContext } from 'contexts/ModalContext'
import { useContext } from 'react'

export function useModal() {
  return useContext(ModalContext)
}
