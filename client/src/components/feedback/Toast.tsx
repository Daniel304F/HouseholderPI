import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useToast, type Toast as ToastType } from '../../contexts/ToastContext'

const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
}

const styles = {
    success: {
        container:
            'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
        icon: 'text-emerald-500 dark:text-emerald-400',
        text: 'text-emerald-800 dark:text-emerald-200',
        progress: 'bg-emerald-500',
    },
    error: {
        container: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800',
        icon: 'text-red-500 dark:text-red-400',
        text: 'text-red-800 dark:text-red-200',
        progress: 'bg-red-500',
    },
    warning: {
        container:
            'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
        icon: 'text-amber-500 dark:text-amber-400',
        text: 'text-amber-800 dark:text-amber-200',
        progress: 'bg-amber-500',
    },
    info: {
        container:
            'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
        icon: 'text-blue-500 dark:text-blue-400',
        text: 'text-blue-800 dark:text-blue-200',
        progress: 'bg-blue-500',
    },
}

interface ToastItemProps {
    toast: ToastType
}

const ToastItem = ({ toast }: ToastItemProps) => {
    const { removeToast } = useToast()
    const [isVisible, setIsVisible] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)
    const Icon = icons[toast.type]
    const style = styles[toast.type]

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => {
            setIsVisible(true)
        })
    }, [])

    const handleClose = () => {
        setIsLeaving(true)
        setTimeout(() => {
            removeToast(toast.id)
        }, 300)
    }

    // Auto-close with leave animation
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const leaveTimer = setTimeout(() => {
                setIsLeaving(true)
            }, toast.duration - 300)

            return () => clearTimeout(leaveTimer)
        }
    }, [toast.duration])

    return (
        <div
            className={cn(
                'relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-sm',
                'transform transition-all duration-300 ease-out',
                isVisible && !isLeaving
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0',
                style.container
            )}
        >
            <Icon className={cn('size-5 flex-shrink-0 mt-0.5', style.icon)} />
            <p className={cn('flex-1 text-sm font-medium', style.text)}>
                {toast.message}
            </p>
            <button
                onClick={handleClose}
                className={cn(
                    'flex-shrink-0 rounded-lg p-1 transition-colors',
                    'hover:bg-black/5 dark:hover:bg-white/10',
                    style.text
                )}
            >
                <X className="size-4" />
            </button>

            {/* Progress bar */}
            {toast.duration && toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
                    <div
                        className={cn('h-full', style.progress)}
                        style={{
                            animation: `shrink ${toast.duration}ms linear forwards`,
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export const ToastContainer = () => {
    const { toasts } = useToast()

    return (
        <>
            {/* CSS for progress bar animation */}
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>

            {/* Toast container */}
            <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end justify-start gap-3 p-4 sm:p-6">
                <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-3">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} />
                    ))}
                </div>
            </div>
        </>
    )
}
