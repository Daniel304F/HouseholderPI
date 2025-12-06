import { HouseHolderButton } from '../components/HouseHolderButton'
import Input from '../components/Input'

export default function Login() {
    return (
        <div className="from-primary-100/30 flex min-h-screen items-center justify-center bg-gradient-to-b to-white px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-neutral-100">
                <div className="mb-6 text-center">
                    <div className="bg-primary-100 text-primary-600 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
                        🔐
                    </div>
                    <h1 className="text-3xl font-extrabold text-neutral-900">
                        Anmelden
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Willkommen zurück bei HouseHolderPI
                    </p>
                </div>

                <form
                    className="space-y-5"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <div>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="z. B. name@beispiel.de"
                            required
                            autoComplete="email"
                            label="E-Mail"
                        />
                    </div>

                    <div>
                        <div className="relative">
                            <Input
                                label="Passwort"
                                id="password"
                                name="password"
                                placeholder="Dein Passwort"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="hover:text-primary-600 absolute inset-y-0 right-2.5 px-3 text-sm text-neutral-500"
                            ></button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                            <input
                                type="checkbox"
                                className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-neutral-300"
                                id="remember"
                            />
                            Angemeldet bleiben
                        </label>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <HouseHolderButton
                            title={'Anmelden'}
                            variant="primary"
                            onClick={function (): void {
                                throw new Error('Function not implemented.')
                            }}
                        />
                        <HouseHolderButton
                            title={'Passwort vergessen?'}
                            variant="ghost"
                            onClick={function (): void {
                                throw new Error('Function not implemented.')
                            }}
                        />
                    </div>

                    <p className="mt-4 text-center text-sm text-neutral-600">
                        Neu hier?{' '}
                        <a
                            href="/signup"
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Konto erstellen
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}
