import { X } from 'lucide-react'
import {
    ModalHeight,
    ModalPosition,
    ModalWidth,
    type ModalOptions,
} from './types'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { IconButton } from '../IconButton'

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

    const containerClasses = `relative bg-white rounded-lg shadow-2xl w-full mx-4 overflow-hidden animate-in slide-in-from-top-4 duration-300 ${widthClasses[width]} ${heightClasses[height]}`

    const renderBody = () => {
        if (options.content) {
            return (
                <div className="text-[15px] text-slate-600">
                    {options.content}
                </div>
            )
        }
        return (
            <p className="text-[15px] leading-relaxed text-slate-600">
                {options.message}
            </p>
        )
    }

    return (
        <div
            className={`animate-in fade-in fixed inset-0 z-50 flex justify-center duration-200 ${positionClasses[position]}`}
        >
            <div
                className="absolute inset-0 bg-slate-900/40"
                onClick={onClose}
            />

            <div className={containerClasses}>
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <h2 className="pr-6 text-xl leading-tight font-semibold text-slate-900">
                        {options.title}
                    </h2>
                    <IconButton
                        icon={X}
                        onClick={onClose}
                        size={20}
                        variant="ghost"
                        ariaLabel="Modal schließen"
                    />
                </div>

                <div className="min-h-[80px] px-6 pb-6">{renderBody()}</div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-md px-4 py-2 text-[15px] font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900"
                    >
                        {options.cancelText || 'Abbrechen'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`cursor-pointer rounded-md px-4 py-2 text-[15px] font-semibold text-white shadow-sm transition-all ${
                            options.isDangerous
                                ? 'bg-red-600 hover:bg-red-700 hover:shadow-md active:bg-red-800'
                                : 'bg-teal-600 hover:bg-teal-700 hover:shadow-md active:bg-teal-800'
                        }`}
                    >
                        {options.confirmText || 'Bestätigen'}
                    </button>
                </div>
            </div>
        </div>
    )
}
