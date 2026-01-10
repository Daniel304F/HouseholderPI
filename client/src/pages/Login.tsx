import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { LogIn } from 'lucide-react'
import { useLogin } from '../hooks/useAuth'
import { PasswordInput } from '../components/auth/PasswordInput'
import { AuthFormLayout } from '../layouts/AuthFormLayout'

export const Login = () => {
    const { mutate: login, isPending } = useLogin()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {}
    )

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {}
        let isValid = true

        if (!email) {
            newErrors.email = 'E-Mail ist erforderlich.'
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Bitte gib eine gültige E-Mail ein.'
            isValid = false
        }

        if (!password) {
            newErrors.password = 'Passwort ist erforderlich.'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }
    // login handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()

        if (validate()) {
            login({ email, password })
        }
    }

    return (
        <AuthFormLayout
            title="Willkommen zurück!"
            subtitle="Logge dich ein, um deine Aufgaben zu sehen."
            cardTitle="Login"
            footer={
                <>
                    Noch kein Konto?{' '}
                    <Link
                        to="/register"
                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                    >
                        Jetzt registrieren
                    </Link>
                </>
            }
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <Input
                    label="E-Mail Adresse"
                    type="email"
                    placeholder="deine-mail@beispiel.de"
                    required
                    autoFocus
                    disabled={isPending}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                />
                <PasswordInput
                    label="Passwort"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isPending}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password)
                            setErrors({ ...errors, password: undefined })
                    }}
                    error={errors.password}
                />

                <div className="pt-2">
                    <Button
                        fullWidth
                        type="submit"
                        isLoading={isPending}
                        icon={<LogIn size={18} />}
                    >
                        Einloggen
                    </Button>
                </div>
            </form>
        </AuthFormLayout>
    )
}
