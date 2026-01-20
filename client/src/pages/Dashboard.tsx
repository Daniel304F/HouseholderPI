import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHeaderContext } from '../contexts/HeaderContext'
import { useNavigate } from 'react-router-dom'
import { Headline } from '../components/Headline'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { LogOut, User } from 'lucide-react'
import { DashboardLayout } from '../layouts/DashboardLayout'

export const Dashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const { setTitle, setSubtitle } = useHeaderContext()

    useEffect(() => {
        setTitle('Dashboard')
        setSubtitle(`Willkommen, ${user?.name ?? 'User'}!`)
        return () => {
            setTitle('')
            setSubtitle('')
        }
    }, [setTitle, setSubtitle, user?.name])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Headline
                    title={`Hallo, ${user?.name ?? 'User'}!`}
                    subtitle="Willkommen in deinem Dashboard"
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
            </div>
        </DashboardLayout>
    )
}
