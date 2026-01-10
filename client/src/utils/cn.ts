import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Kombiniert Tailwind CSS Klassen intelligent.
 */
export const cn = (...inputs: ClassValue[]): string => {
    return twMerge(clsx(inputs))
}
