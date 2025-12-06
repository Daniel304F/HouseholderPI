import { forwardRef, type ComponentPropsWithoutRef, useState } from 'react'

type InputProps = {
    label: string
} & ComponentPropsWithoutRef<'input'>

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, type: initialType, ...props },
    ref
) {
    const [showPwd, setShowPwd] = useState(false)

    const classes =
        'w-full rounded-xl border border-neutral-300 px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'

    const isPasswordField = label === 'Passwort'

    const currentType = isPasswordField
        ? showPwd
            ? 'text'
            : 'password'
        : initialType

    return (
        <p className="my-4 flex flex-col gap-1">
            <label className="text-sm font-bold text-neutral-500 uppercase">
                {label}
            </label>

            <div className="relative">
                <input
                    type={currentType}
                    ref={ref}
                    className={classes}
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        aria-label={
                            showPwd ? 'Passwort verbergen' : 'Passwort anzeigen'
                        }
                        onClick={() => setShowPwd((v) => !v)}
                        className="hover:text-primary-600 absolute inset-y-0 right-2.5 px-3 text-sm text-neutral-500"
                    >
                        {showPwd ? 'Verbergen' : 'Anzeigen'}
                    </button>
                )}
            </div>
        </p>
    )
})

export default Input
