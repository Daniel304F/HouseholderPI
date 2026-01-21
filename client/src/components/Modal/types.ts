import type { ReactNode } from 'react'

export const ModalWidth = {
    Small: 'sm',
    Medium: 'md',
    Large: 'lg',
    XLarge: 'xl',
    Full: 'full',
} as const

export type ModalWidth = (typeof ModalWidth)[keyof typeof ModalWidth]

export const ModalHeight = {
    Auto: 'auto',
    Small: 'sm',
    Medium: 'md',
    Large: 'lg',
    Full: 'full',
} as const

export type ModalHeight = (typeof ModalHeight)[keyof typeof ModalHeight]

export const ModalPosition = {
    Top: 'top',
    Center: 'center',
} as const

export type ModalPosition = (typeof ModalPosition)[keyof typeof ModalPosition]

export interface ModalOptions {
    title: string
    message?: string
    content?: ReactNode
    confirmText?: string
    cancelText?: string
    isDangerous?: boolean
    width?: ModalWidth
    height?: ModalHeight
    position?: ModalPosition
    onConfirm?: () => void | Promise<void>
}
