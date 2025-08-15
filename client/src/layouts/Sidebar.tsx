import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    return (
        <div className='text-gray-600 max-h-full w-fit flex flex-col space-x-4 space-y-4 m-3'>
            <NavLink to="/">
                Aufgaben
            </NavLink>
            <NavLink to="/">
                Gruppen
            </NavLink>
            <NavLink to="/">
                Statistiken
            </NavLink>
        </div>
    )
}