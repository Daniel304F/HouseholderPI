import { useState } from "react";
import { HouseHolderButton } from "../components/HouseHolderButton";

export default function Signup() {
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-100/30 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600">
            🏠
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Registrieren</h1>
          <p className="text-sm text-gray-600 mt-1">Erstelle dein HouseHolderPI-Konto</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="z. B. name@beispiel.de"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Mind. 8 Zeichen"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute inset-y-0 right-2.5 px-3 text-sm text-gray-500 hover:text-fuchsia-600"
              >
                {showPwd ? "Verbergen" : "Anzeigen"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen
            </label>
            <div className="relative">
              <input
                type={showPwd2 ? "text" : "password"}
                id="confirm"
                name="confirm"
                placeholder="Passwort wiederholen"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd2((v) => !v)}
                className="absolute inset-y-0 right-2.5 px-3 text-sm text-gray-500 hover:text-fuchsia-600"
              >
                {showPwd2 ? "Verbergen" : "Anzeigen"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <HouseHolderButton
              title={"Konto erstellen"}
              variant="primary"
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
            <HouseHolderButton
              title={"Passwort vergessen?"}
              variant="ghost"
              onClick={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Schon ein Konto?{" "}
            <a href="/login" className="font-medium text-blue-500 hover:underline">
              Anmelden
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
