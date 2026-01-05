import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', type = 'text', label, error, ...props }, ref) => {
        const baseClasses =
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-all duration-200 outline-none placeholder:text-neutral-400 dark:bg-neutral-800 dark:text-neutral-100'
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
                    className={`${baseClasses} ${
                        error
                            ? 'border-error-500 focus:border-error-500 focus:ring-2 focus:ring-red-500/20'
                            : 'focus:border-brand-500 focus:ring-brand-500/20 dark:focus:border-brand-500 border-neutral-300 focus:ring-2 dark:border-neutral-700'
                    } ${className} `}
                    {...props}
                />
                {error && (
                    <p className="text-error-500 mt-1 text-xs">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
