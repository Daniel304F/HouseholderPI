import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const Dashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    return (
        <>
            <div>Hello {user && user.name}</div>
        </>
    )
}
