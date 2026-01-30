import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: SelectOption[]
    placeholder?: string
}

const baseStyles = cn(
    'w-full appearance-none rounded-2xl border px-4 py-3 pr-10 text-sm',
    'bg-white/85 dark:bg-neutral-900/60 backdrop-blur-sm',
    'text-neutral-900 dark:text-neutral-100',
    'outline-none transition-all duration-200',
    'hover:border-neutral-300 dark:hover:border-neutral-500',
    'shadow-sm hover:shadow-md cursor-pointer'
)

const normalStyles = cn(
    'border-neutral-200/90 dark:border-neutral-700/80',
    'focus:border-brand-400 focus:ring-brand-500/25 focus:ring-2',
    'focus:shadow-brand-500/10 focus:shadow-lg'
)

const errorStyles = cn(
    'border-error-400 focus:border-error-500',
    'focus:ring-error-500/20 focus:shadow-error-500/10 focus:ring-2'
)

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            baseStyles,
                            error ? errorStyles : normalStyles,
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className={cn(
                            'absolute right-3 top-1/2 -translate-y-1/2',
                            'size-5 text-neutral-400 pointer-events-none'
                        )}
                    />
                </div>
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

Select.displayName = 'Select'
