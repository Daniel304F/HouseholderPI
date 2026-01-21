import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const baseStyles = cn(
    'w-full rounded-xl border px-4 py-2.5 text-sm',
    'bg-white dark:bg-neutral-800',
    'text-neutral-900 dark:text-neutral-100',
    'placeholder:text-neutral-400',
    'outline-none transition-all duration-200'
)

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = 'text', label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        baseStyles,
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'focus:border-brand-500 focus:ring-brand-500/20 border-neutral-300 focus:ring-2 dark:border-neutral-700',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        )
    }
)

Input.displayName = 'Input'
