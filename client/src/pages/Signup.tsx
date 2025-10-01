import { HouseHolderButton } from '../components/HouseHolderButton';

export default function Signup() {
  return (
    <div className="min-h-screen flex items-start md:items-center justify-center bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-purple-600">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6 md:p-8 mt-20 md:mt-0">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-6">Registrieren</h1>

          <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">
            E-Mail
          </label>
          <input
            type="email"
            placeholder="Enter E-Mail"
            name="email"
            id="email"
            required
            className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />

          <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-700">
            Passwort
          </label>
          <input
            type="password"
            placeholder="Passwort"
            name="password"
            id="password"
            required
            className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />

          <label htmlFor="confirm" className="mb-1 text-sm font-medium text-gray-700">
            Passwort bestätigen
          </label>
          <input
            type="password"
            placeholder="Passwort bestätigen"
            name="confirm"
            id="confirm"
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>
        <div className='flex row gap-5 '>
            <HouseHolderButton title={'Senden'} variant='primary' onClick={function (): void {
                    throw new Error('Function not implemented.');
                } }></HouseHolderButton>
            <HouseHolderButton title={'Passwort vergessen?'} variant='ghost' onClick={function (): void {
                    throw new Error('Function not implemented.');
                } }></HouseHolderButton>
        </div>
        </div>
    </div>
  );
}
