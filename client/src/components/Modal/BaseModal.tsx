import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { IconButton } from '../common/IconButton'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { ModalWidth, ModalHeight, ModalPosition } from './types'

export interface BaseModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    footer?: ReactNode
    width?: ModalWidth
    height?: ModalHeight
    position?: ModalPosition
    className?: string
}

const widthClasses: Record<ModalWidth, string> = {
    [ModalWidth.Small]: 'max-w-sm',
    [ModalWidth.Medium]: 'max-w-lg',
    [ModalWidth.Large]: 'max-w-2xl',
    [ModalWidth.XLarge]: 'max-w-4xl',
    [ModalWidth.Full]: 'max-w-full mx-8',
}

const heightClasses: Record<ModalHeight, string> = {
    [ModalHeight.Auto]: '',
    [ModalHeight.Small]: 'max-h-[50vh]',
    [ModalHeight.Medium]: 'max-h-[60vh]',
    [ModalHeight.Large]: 'max-h-[80vh]',
    [ModalHeight.Full]: 'max-h-[90vh]',
}

const positionClasses: Record<ModalPosition, string> = {
    [ModalPosition.Top]: 'items-start pt-20',
    [ModalPosition.Center]: 'items-center',
}

export const BaseModal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = ModalWidth.Medium,
    height = ModalHeight.Auto,
    position = ModalPosition.Top,
    className,
}: BaseModalProps) => {
    useKeyboardShortcut({
        enabled: isOpen,
        onEscape: onClose,
        preventDefault: true,
    })

    if (!isOpen) return null

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex justify-center bg-black/50 p-4',
                'animate-in fade-in duration-200',
                positionClasses[position]
            )}
        >
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal Container */}
            <div
                className={cn(
                    'relative w-full rounded-2xl',
                    'bg-white dark:bg-neutral-800',
                    'animate-in slide-in-from-top-4 fade-in duration-300',
                    widthClasses[width],
                    heightClasses[height],
                    height !== ModalHeight.Auto && 'flex flex-col',
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h2>
                    <IconButton
                        icon={<X className="size-5" />}
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label="Schließen"
                    />
                </div>

                {/* Content */}
                <div
                    className={cn(
                        'p-6',
                        height !== ModalHeight.Auto &&
                            'min-h-0 flex-1 overflow-y-auto'
                    )}
                >
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
