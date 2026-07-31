import type { ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
}

export function Modal({ open, title, children }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="panel modal-panel">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}