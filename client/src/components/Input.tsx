import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const baseStyles = cn(
    'w-full rounded-2xl border px-4 py-3 text-sm',
    'bg-white/85 dark:bg-neutral-900/60 backdrop-blur-sm',
    'text-neutral-900 dark:text-neutral-100',
    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
    'outline-none transition-all duration-200',
    'hover:border-neutral-300 dark:hover:border-neutral-500',
    'shadow-sm hover:shadow-md'
)

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = 'text', label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        baseStyles,
                        error
                            ? 'border-error-400 focus:border-error-500 focus:ring-error-500/20 focus:shadow-error-500/10 focus:ring-2'
                            : cn(
                                  'border-neutral-200/90 dark:border-neutral-700/80',
                                  'focus:border-brand-400 focus:ring-brand-500/25 focus:ring-2',
                                  'focus:shadow-brand-500/10 focus:shadow-lg'
                              ),
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-error-500 mt-1.5 flex items-center gap-1 text-xs font-medium">
                        <span className="bg-error-500 inline-block h-1 w-1 rounded-full" />
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
