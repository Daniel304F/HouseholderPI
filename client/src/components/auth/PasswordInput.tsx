import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from '../common'

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
    (props, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    {...props}
                    type={showPassword ? 'text' : 'password'}
                    className={`pr-12 ${props.className || ''}`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
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
