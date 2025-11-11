import { HouseHolderButton } from '../components/HouseHolderButton'
import Input from '../components/Input'

export default function Login() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-fuchsia-100/30 to-white px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600">
                        🔐
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Anmelden
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
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
                                className="absolute inset-y-0 right-2.5 px-3 text-sm text-gray-500 hover:text-fuchsia-600"
                            ></button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-fuchsia-600 focus:ring-blue-500"
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

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Neu hier?{' '}
                        <a
                            href="/signup"
                            className="font-medium text-blue-500 hover:underline"
                        >
                            Konto erstellen
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}
