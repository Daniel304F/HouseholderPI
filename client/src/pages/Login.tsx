import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button, Input } from '../components/common'
import { PasswordInput } from '../components/forms'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { AuthFormLayout } from '../layouts/AuthFormLayout'
import { isApiError, getErrorMessage } from '../lib/axios'

export const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const toast = useToast()

    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<{
        email?: string
        password?: string
        general?: string
    }>({})

    // Ursprüngliche URL für Redirect nach Login
    const from =
        (location.state as { from?: Location })?.from?.pathname || '/dashboard'

    const validate = () => {
        const newErrors: typeof errors = {}
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!validate()) return

        setIsLoading(true)

        try {
            await login({ email, password })
            toast.success('Erfolgreich eingeloggt')
            navigate(from, { replace: true })
        } catch (error) {
            if (isApiError(error) && error.response?.status === 401) {
                setErrors({ general: 'E-Mail oder Passwort ist falsch.' })
            } else {
                setErrors({ general: getErrorMessage(error) })
            }
        } finally {
            setIsLoading(false)
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
                {errors.general && (
                    <div className="border-error-200 bg-error-50 text-error-600 dark:border-error-800 dark:bg-error-950 dark:text-error-400 rounded-lg border p-3 text-sm">
                        {errors.general}
                    </div>
                )}

                <Input
                    label="E-Mail Adresse"
                    type="email"
                    placeholder="deine-mail@beispiel.de"
                    required
                    autoFocus
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email)
                            setErrors({ ...errors, email: undefined })
                    }}
                    error={errors.email}
                />

                <PasswordInput
                    label="Passwort"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    value={password}
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
                        isLoading={isLoading}
                        icon={<LogIn size={18} />}
                    >
                        Einloggen
                    </Button>
                </div>
            </form>
        </AuthFormLayout>
    )
}
