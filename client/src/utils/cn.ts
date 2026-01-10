import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * tailwind css klassen kombiniert
 */
export const cn = (...inputs: ClassValue[]): string => {
    return twMerge(clsx(inputs))
}
