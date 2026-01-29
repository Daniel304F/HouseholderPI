import { X } from 'lucide-react'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { IconButton } from '../IconButton'
import {
    ModalHeight,
    ModalPosition,
    type ModalOptions,
    ModalWidth,
} from './types'

interface ModalProps {
    isOpen: boolean
    options: ModalOptions | null
    onClose: () => void
    onConfirm: () => void
}

export const Modal = ({ isOpen, options, onClose, onConfirm }: ModalProps) => {
    useKeyboardShortcut({
        enabled: isOpen,
        onEscape: onClose,
        preventDefault: true,
    })

    if (!isOpen || !options) {
        return null
    }

    const width = options.width || ModalWidth.Medium
    const height = options.height || ModalHeight.Auto
    const position = options.position || ModalPosition.Top

    const widthClasses = {
        [ModalWidth.Small]: 'max-w-sm',
        [ModalWidth.Medium]: 'max-w-lg',
        [ModalWidth.Large]: 'max-w-2xl',
        [ModalWidth.XLarge]: 'max-w-4xl',
        [ModalWidth.Full]: 'max-w-full mx-8',
    }

    const heightClasses = {
        [ModalHeight.Auto]: '',
        [ModalHeight.Small]: 'max-h-[50vh]',
        [ModalHeight.Medium]: 'max-h-[60vh]',
        [ModalHeight.Large]: 'max-h-[80vh]',
        [ModalHeight.Full]: 'max-h-[90vh]',
    }

    const positionClasses = {
        [ModalPosition.Top]: 'items-start pt-32',
        [ModalPosition.Center]: 'items-center',
    }

    const containerClasses = `relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full mx-4 overflow-hidden animate-in slide-in-from-top-4 duration-300 border border-neutral-200/50 dark:border-neutral-700/50 ${widthClasses[width]} ${heightClasses[height]}`

    const renderBody = () => {
        if (options.content) {
            return (
                <div className="text-[15px] text-neutral-600 dark:text-neutral-300">
                    {options.content}
                </div>
            )
        }
        return (
            <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {options.message}
            </p>
        )
    }

    return (
        <div
            className={`animate-in fade-in fixed inset-0 z-50 flex justify-center duration-200 ${positionClasses[position]}`}
        >
            <div
                className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm dark:bg-neutral-950/70"
                onClick={onClose}
            />

            <div className={containerClasses}>
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <h2 className="pr-6 text-xl leading-tight font-semibold text-neutral-900 dark:text-neutral-100">
                        {options.title}
                    </h2>
                    <IconButton
                        icon={<X className="h-5 w-5" />}
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                    />
                </div>

                <div className="min-h-[80px] px-6 pb-6">{renderBody()}</div>

                <div className="flex items-center justify-end gap-3 border-t border-neutral-200 bg-neutral-50/80 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/80">
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-5 py-2.5 text-[15px] font-medium text-neutral-700 transition-all hover:bg-neutral-200/80 hover:text-neutral-900 active:scale-[0.98] dark:text-neutral-300 dark:hover:bg-neutral-700/80 dark:hover:text-neutral-100"
                    >
                        {options.cancelText || 'Abbrechen'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`cursor-pointer rounded-xl px-5 py-2.5 text-[15px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] ${
                            options.isDangerous
                                ? 'bg-error-500 hover:bg-error-600 active:bg-error-700'
                                : 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700'
                        }`}
                    >
                        {options.confirmText || 'Bestätigen'}
                    </button>
                </div>
            </div>
        </div>
    )
}
