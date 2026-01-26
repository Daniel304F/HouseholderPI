import { apiClient } from '../lib/axios'

// Types
export interface Task {
    id: string
    groupId: string
    title: string
    description?: string
    status: 'pending' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    assignedTo: string | null
    dueDate: string
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface CreateTaskRequest {
    title: string
    description?: string
    status?: 'pending' | 'in-progress' | 'completed'
    priority?: 'low' | 'medium' | 'high'
    assignedTo?: string | null
    dueDate: string
}

export interface UpdateTaskRequest {
    title?: string
    description?: string
    status?: 'pending' | 'in-progress' | 'completed'
    priority?: 'low' | 'medium' | 'high'
    assignedTo?: string | null
    dueDate?: string
}

export interface AssignTaskRequest {
    assignedTo: string | null
}

// API Response Types
interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

// API Functions
export const tasksApi = {
    // Alle Aufgaben einer Gruppe abrufen
    getGroupTasks: async (groupId: string): Promise<Task[]> => {
        const response = await apiClient.get<ApiResponse<Task[]>>(
            `/groups/${groupId}/tasks`
        )
        return response.data.data
    },

    // Einzelne Aufgabe abrufen
    getTask: async (groupId: string, taskId: string): Promise<Task> => {
        const response = await apiClient.get<ApiResponse<Task>>(
            `/groups/${groupId}/tasks/${taskId}`
        )
        return response.data.data
    },

    // Neue Aufgabe erstellen
    createTask: async (
        groupId: string,
        data: CreateTaskRequest
    ): Promise<Task> => {
        const response = await apiClient.post<ApiResponse<Task>>(
            `/groups/${groupId}/tasks`,
            data
        )
        return response.data.data
    },

    // Aufgabe aktualisieren
    updateTask: async (
        groupId: string,
        taskId: string,
        data: UpdateTaskRequest
    ): Promise<Task> => {
        const response = await apiClient.patch<ApiResponse<Task>>(
            `/groups/${groupId}/tasks/${taskId}`,
            data
        )
        return response.data.data
    },

    // Aufgabe löschen
    deleteTask: async (groupId: string, taskId: string): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}/tasks/${taskId}`)
    },

    // Aufgabe zuweisen
    assignTask: async (
        groupId: string,
        taskId: string,
        data: AssignTaskRequest
    ): Promise<Task> => {
        const response = await apiClient.patch<ApiResponse<Task>>(
            `/groups/${groupId}/tasks/${taskId}/assign`,
            data
        )
        return response.data.data
    },
}
