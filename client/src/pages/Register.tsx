import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Headline } from '../components/ui/Headline'
import { UserPlus } from 'lucide-react'

export const Register = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [errors, setErrors] = useState<{
        name?: string
        email?: string
        password?: string
        confirmPassword?: string
    }>({})

    const validate = () => {
        const newErrors: typeof errors = {}
        let isValid = true

        if (!name.trim()) {
            newErrors.name = 'Dein Name wird benötigt.'
            isValid = false
        }

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
        } else if (password.length < 8) {
            newErrors.password = 'Das Passwort muss mindestens 8 Zeichen haben.'
            isValid = false
        }

        if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Die Passwörter stimmen nicht überein.'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()

        if (validate()) {
            setIsLoading(true)

            // TODO: API Call zur Registrierung
            setTimeout(() => {
                setIsLoading(false)
                navigate('/login')
            }, 1500)
        }
    }

    return (
        <div className="flex w-full items-center justify-center py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Headline
                        title="Werde HouseHolder"
                        subtitle="Erstelle ein HouseHolder-Konto."
                    />
                </div>

                <Card title="Registrierung">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            label="Dein Name"
                            placeholder="Max Mustermann"
                            value={name}
                            required
                            onChange={(e) => {
                                setName(e.target.value)
                                if (errors.name)
                                    setErrors({ ...errors, name: undefined })
                            }}
                            error={errors.name}
                        />

                        <Input
                            label="E-Mail Adresse"
                            type="email"
                            placeholder="deine-mail@beispiel.de"
                            value={email}
                            required
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (errors.email)
                                    setErrors({ ...errors, email: undefined })
                            }}
                            error={errors.email}
                        />

                        <Input
                            label="Passwort"
                            type="password"
                            placeholder="Mindestens 8 Zeichen"
                            value={password}
                            required
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (errors.password)
                                    setErrors({
                                        ...errors,
                                        password: undefined,
                                    })
                            }}
                            error={errors.password}
                        />

                        <Input
                            label="Passwort wiederholen"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            required
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                if (errors.confirmPassword)
                                    setErrors({
                                        ...errors,
                                        confirmPassword: undefined,
                                    })
                            }}
                            error={errors.confirmPassword}
                        />

                        <div className="pt-2">
                            <Button
                                fullWidth
                                type="submit"
                                isLoading={isLoading}
                                icon={<UserPlus size={18} />}
                            >
                                Konto erstellen
                            </Button>
                        </div>
                    </form>
                </Card>

                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Du hast schon ein Konto?{' '}
                    <Link
                        to="/login"
                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                    >
                        Hier einloggen
                    </Link>
                </p>
            </div>
        </div>
    )
}
