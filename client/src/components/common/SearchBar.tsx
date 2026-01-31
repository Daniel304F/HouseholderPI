import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    onClear?: () => void
    autoFocus?: boolean
}

export const SearchBar = ({
    value,
    onChange,
    placeholder = 'Suchen...',
    className,
    onClear,
    autoFocus = false,
}: SearchBarProps) => {
    const handleClear = () => {
        onChange('')
        onClear?.()
    }

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={cn(
                    'w-full rounded-lg border py-2 pl-10 pr-10',
                    'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                    'text-neutral-900 dark:text-white',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                    'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none focus:ring-2',
                    'transition-colors'
                )}
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    )
}
