import { type ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface SidebarNavItemProps {
    icon?: ReactNode
    label: string
    isActive?: boolean
    onClick?: () => void
    badge?: string | number
}

export const SidebarNavItem = ({
    icon,
    label,
    isActive = false,
    onClick,
    badge,
}: SidebarNavItemProps) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className={cn(
                // --- Base Layout ---
                'group relative flex w-full items-center gap-3 px-3 py-2',
                'text-left text-sm font-medium',

                // --- Cursor & Shape ---
                'cursor-pointer rounded-lg outline-none', // <--- WICHTIG: cursor-pointer
                'focus-visible:ring-brand-500/30 focus-visible:ring-2',

                // --- Transitions ---
                // Wir nutzen transition-all für weiche Farb- und Transform-Wechsel
                'transition-all duration-200 ease-out',

                // --- States ---
                isActive
                    ? [
                          'bg-brand-50 dark:bg-brand-500/10',
                          'text-brand-700 dark:text-brand-300',
                          'shadow-sm', // Leichter "Lift" Effekt für aktive Elemente
                      ]
                    : [
                          'text-neutral-600 dark:text-neutral-400',
                          // HOVER EFFECTS:
                          // 1. Hellerer Hintergrund
                          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                          // 2. Text wird dunkler (besserer Kontrast)
                          'hover:text-neutral-900 dark:hover:text-neutral-100',
                          // 3. Optional: Ganz leichter "Schubser" nach rechts (micro interaction)
                          // Wenn dir das zu unruhig ist, nimm 'hover:translate-x-0.5' raus
                          'hover:translate-x-1',
                      ]
            )}
        >
            {/* Active Indicator (Pill) */}
            <span
                className={cn(
                    'absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full',
                    'transition-all duration-300 ease-out', // Langsamere, edlere Animation
                    isActive
                        ? 'bg-brand-500 scale-y-100 opacity-100'
                        : 'bg-brand-400 scale-y-50 opacity-0' // Schrumpft beim Ausblenden
                )}
            />

            {/* Icon Wrapper */}
            {icon && (
                <span
                    className={cn(
                        'flex size-5 shrink-0 items-center justify-center',
                        'transition-all duration-200', // Icon animiert separat
                        isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : [
                                  // Im inaktiven Zustand:
                                  'text-neutral-400',
                                  // Beim Hover des Buttons (group-hover):
                                  // Icon wird grün (Vorschau auf Aktivierung) und wächst minimal
                                  'group-hover:text-brand-500 group-hover:scale-110',
                                  'dark:group-hover:text-brand-400 dark:text-neutral-500',
                              ]
                    )}
                >
                    {icon}
                </span>
            )}

            {/* Label */}
            <span className="flex-1 truncate tracking-tight">{label}</span>

            {/* Badge */}
            {badge !== undefined && (
                <span
                    className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-md px-1.5',
                        'text-[11px] leading-none font-bold',
                        'transition-transform duration-200', // Badge bewegt sich auch leicht
                        isActive
                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                            : 'bg-neutral-100 text-neutral-600 group-hover:scale-105 group-hover:bg-white group-hover:shadow-sm dark:bg-neutral-800 dark:text-neutral-400'
                    )}
                >
                    {badge}
                </span>
            )}
        </button>
    )
}
