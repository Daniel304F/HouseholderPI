export interface PasswordRequirement {
    id: string
    label: string
    validator: (password: string) => boolean
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
    {
        id: 'length',
        label: 'Mindestens 8 Zeichen',
        validator: (pw) => pw.length >= 8,
    },
    {
        id: 'uppercase',
        label: 'Ein Großbuchstabe',
        validator: (pw) => /[A-Z]/.test(pw),
    },
    {
        id: 'lowercase',
        label: 'Ein Kleinbuchstabe',
        validator: (pw) => /[a-z]/.test(pw),
    },
    {
        id: 'number',
        label: 'Eine Zahl',
        validator: (pw) => /[0-9]/.test(pw),
    },
    {
        id: 'special',
        label: 'Ein Sonderzeichen (!@#$%^&*)',
        validator: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
]

export const calculatePasswordStrength = (password: string): number => {
    return PASSWORD_REQUIREMENTS.filter((req) => req.validator(password)).length
}
