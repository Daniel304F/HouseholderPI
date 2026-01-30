import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from '../common/Input'
import { cn } from '../../utils/cn'

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
    (props, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    {...props}
                    type={showPassword ? 'text' : 'password'}
                    className={cn('pr-12', props.className)}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                        'absolute right-3 top-1/2 -translate-y-1/2',
                        'text-neutral-500 transition-colors',
                        'hover:text-neutral-700',
                        'dark:text-neutral-400 dark:hover:text-neutral-200',
                        props.label && 'top-[calc(50%+12px)]'
                    )}
                    aria-label={
                        showPassword
                            ? 'Passwort verbergen'
                            : 'Passwort anzeigen'
                    }
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        )
    }
)

PasswordInput.displayName = 'PasswordInput'
