import { History, AlertCircle } from 'lucide-react'
import { Button } from '../../../components/common'

// =============================================================================
// Page Header
// =============================================================================

export const PageHeader = () => (
    <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
            <History className="size-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Aufgaben-Historie
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
                Alle erledigten Aufgaben im Überblick
            </p>
        </div>
    </div>
)

// =============================================================================
// Stats Cards
// =============================================================================

interface StatsGridProps {
    total: number
    high: number
    medium: number
    low: number
}

export const StatsGrid = ({ total, high, medium, low }: StatsGridProps) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Gesamt erledigt" value={total} />
        <StatCard
            label="Hohe Priorität"
            value={high}
            colorClass="text-error-600 dark:text-error-400"
        />
        <StatCard
            label="Mittlere Priorität"
            value={medium}
            colorClass="text-amber-600 dark:text-amber-400"
        />
        <StatCard
            label="Niedrige Priorität"
            value={low}
            colorClass="text-neutral-600 dark:text-neutral-400"
        />
    </div>
)

interface StatCardProps {
    label: string
    value: number
    colorClass?: string
}

const StatCard = ({ label, value, colorClass }: StatCardProps) => (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${colorClass || 'text-neutral-900 dark:text-white'}`}>
            {value}
        </p>
    </div>
)

// =============================================================================
// States
// =============================================================================

export const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-300 py-12 dark:border-neutral-600">
        <History className="size-12 text-neutral-400" />
        <div className="text-center">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
                Keine erledigten Aufgaben
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Sobald du Aufgaben abschließt, erscheinen sie hier
            </p>
        </div>
    </div>
)

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="size-12 text-error-500" />
        <p className="text-neutral-500 dark:text-neutral-400">
            Historie konnte nicht geladen werden.
        </p>
        <Button onClick={onRetry}>Erneut versuchen</Button>
    </div>
)

export const TaskHistorySkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-2">
                <div className="h-7 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 w-64 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
                />
            ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
    </div>
)
