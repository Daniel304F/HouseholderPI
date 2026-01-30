import { useState, useCallback, useRef } from 'react'
import type { Task } from '../api/tasks'

export type ColumnStatus = 'pending' | 'in-progress' | 'completed'

export interface DragState {
    /** Die Task die gerade gezogen wird */
    draggedTask: Task | null
    /** Die Spalte über der sich die Task gerade befindet */
    targetColumn: ColumnStatus | null
    /** Ob gerade ein Drag aktiv ist */
    isDragging: boolean
}

interface UseKanbanDragDropOptions {
    /** Callback wenn eine Task in eine neue Spalte verschoben wird */
    onTaskMove: (taskId: string, newStatus: ColumnStatus) => Promise<void>
}

interface UseKanbanDragDropReturn {
    /** Aktueller Drag-Zustand */
    dragState: DragState
    /** Startet den Drag für eine Task */
    handleDragStart: (task: Task) => void
    /** Beendet den Drag (Task losgelassen) */
    handleDragEnd: () => void
    /** Wird aufgerufen wenn eine Task über eine Spalte gezogen wird */
    handleDragOver: (columnId: ColumnStatus) => void
    /** Wird aufgerufen wenn eine Task eine Spalte verlässt */
    handleDragLeave: () => void
    /** Wird aufgerufen wenn eine Task in eine Spalte gedropt wird */
    handleDrop: (columnId: ColumnStatus) => Promise<void>
    /** Props für eine draggable Task Card */
    getDragProps: (task: Task) => {
        draggable: boolean
        onDragStart: (e: React.DragEvent) => void
        onDragEnd: (e: React.DragEvent) => void
    }
    /** Props für eine Drop-Zone (Spalte) */
    getDropZoneProps: (columnId: ColumnStatus) => {
        onDragOver: (e: React.DragEvent) => void
        onDragLeave: (e: React.DragEvent) => void
        onDrop: (e: React.DragEvent) => void
    }
    /** Prüft ob eine Spalte gerade das Drop-Target ist */
    isDropTarget: (columnId: ColumnStatus) => boolean
    /** Ob gerade ein Update läuft */
    isUpdating: boolean
}

/**
 * Hook für Drag-and-Drop Funktionalität im Kanban Board
 * Ermöglicht das Verschieben von Tasks zwischen Spalten mit API-Update
 */
export const useKanbanDragDrop = ({
    onTaskMove,
}: UseKanbanDragDropOptions): UseKanbanDragDropReturn => {
    const [dragState, setDragState] = useState<DragState>({
        draggedTask: null,
        targetColumn: null,
        isDragging: false,
    })
    const [isUpdating, setIsUpdating] = useState(false)

    // Ref um Race Conditions zu vermeiden
    const draggedTaskRef = useRef<Task | null>(null)

    const handleDragStart = useCallback((task: Task) => {
        draggedTaskRef.current = task
        setDragState({
            draggedTask: task,
            targetColumn: null,
            isDragging: true,
        })
    }, [])

    const handleDragEnd = useCallback(() => {
        draggedTaskRef.current = null
        setDragState({
            draggedTask: null,
            targetColumn: null,
            isDragging: false,
        })
    }, [])

    const handleDragOver = useCallback((columnId: ColumnStatus) => {
        setDragState((prev) => ({
            ...prev,
            targetColumn: columnId,
        }))
    }, [])

    const handleDragLeave = useCallback(() => {
        setDragState((prev) => ({
            ...prev,
            targetColumn: null,
        }))
    }, [])

    const handleDrop = useCallback(
        async (columnId: ColumnStatus) => {
            const task = draggedTaskRef.current
            if (!task || task.status === columnId) {
                handleDragEnd()
                return
            }

            setIsUpdating(true)

            try {
                await onTaskMove(task.id, columnId)
            } catch (error) {
                console.error('Failed to move task:', error)
            } finally {
                setIsUpdating(false)
                handleDragEnd()
            }
        },
        [onTaskMove, handleDragEnd]
    )

    const getDragProps = useCallback(
        (task: Task) => ({
            draggable: true,
            onDragStart: (e: React.DragEvent) => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', task.id)

                requestAnimationFrame(() => {
                    handleDragStart(task)
                })
            },
            onDragEnd: () => {
                handleDragEnd()
            },
        }),
        [handleDragStart, handleDragEnd]
    )

    const getDropZoneProps = useCallback(
        (columnId: ColumnStatus) => ({
            onDragOver: (e: React.DragEvent) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                handleDragOver(columnId)
            },
            onDragLeave: (e: React.DragEvent) => {
                const relatedTarget = e.relatedTarget as HTMLElement
                const currentTarget = e.currentTarget as HTMLElement

                if (!currentTarget.contains(relatedTarget)) {
                    handleDragLeave()
                }
            },
            onDrop: (e: React.DragEvent) => {
                e.preventDefault()
                handleDrop(columnId)
            },
        }),
        [handleDragOver, handleDragLeave, handleDrop]
    )

    const isDropTarget = useCallback(
        (columnId: ColumnStatus) => {
            return (
                dragState.isDragging &&
                dragState.targetColumn === columnId &&
                dragState.draggedTask?.status !== columnId
            )
        },
        [dragState]
    )

    return {
        dragState,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        getDragProps,
        getDropZoneProps,
        isDropTarget,
        isUpdating,
    }
}
