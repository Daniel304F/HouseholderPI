import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Headline } from '../components/Headline'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { LogOut, User } from 'lucide-react'
import { DashboardLayout } from '../layouts/DashboardLayout'

export const Dashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                        title="Dein Profil"
                        actions={<User className="text-brand-500" />}
                    >
                        <div className="space-y-3">
                            <div>
                                <span className="text-text-muted text-sm">
                                    Name
                                </span>
                                <p className="text-text font-medium">
                                    {user?.name}
                                </p>
                            </div>
                            <div>
                                <span className="text-text-muted text-sm">
                                    E-Mail
                                </span>
                                <p className="text-text font-medium">
                                    {user?.email}
                                </p>
                            </div>
                            <div>
                                <span className="text-text-muted text-sm">
                                    Mitglied seit
                                </span>
                                <p className="text-text font-medium">
                                    {user?.createdAt
                                        ? new Date(
                                              user.createdAt
                                          ).toLocaleDateString('de-DE', {
                                              day: '2-digit',
                                              month: 'long',
                                              year: 'numeric',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                icon={<LogOut size={18} />}
                            >
                                Ausloggen
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
