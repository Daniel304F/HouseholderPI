import { apiClient } from '../lib/axios'

// Types
export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskLinkType =
    | 'blocks'
    | 'blocked-by'
    | 'relates-to'
    | 'duplicates'
    | 'duplicated-by'

export interface TaskLink {
    taskId: string
    linkType: TaskLinkType
}

export interface TaskAttachment {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    uploadedBy: string
    uploadedAt: string
    url: string
}

export interface CompletionProof {
    filename: string
    originalName: string
    mimeType: string
    uploadedBy: string
    uploadedAt: string
    note?: string
    url: string
}

export interface Task {
    id: string
    groupId: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    assignedTo: string | null
    dueDate: string
    createdBy: string
    createdAt: string
    updatedAt: string
    parentTaskId: string | null
    linkedTasks: TaskLink[]
    attachments: TaskAttachment[]
    completionProof: CompletionProof | null
    completedAt: string | null
    completedBy: string | null
    archived?: boolean
}

export interface TaskWithDetails extends Task {
    subtasks: Task[]
    groupName?: string
    assignedToName?: string
    createdByName?: string
}

export interface CreateTaskRequest {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    assignedTo?: string | null
    dueDate: string
    parentTaskId?: string | null
}

export interface UpdateTaskRequest {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    assignedTo?: string | null
    dueDate?: string
    parentTaskId?: string | null
}

export interface AssignTaskRequest {
    assignedTo: string | null
}

export interface LinkTaskRequest {
    targetTaskId: string
    linkType: TaskLinkType
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

    // Aufgabe mit Details (inkl. Subtasks) abrufen
    getTaskWithDetails: async (
        groupId: string,
        taskId: string
    ): Promise<TaskWithDetails> => {
        const response = await apiClient.get<ApiResponse<TaskWithDetails>>(
            `/groups/${groupId}/tasks/${taskId}/details`
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

    // Subtask erstellen
    createSubtask: async (
        groupId: string,
        parentTaskId: string,
        data: CreateTaskRequest
    ): Promise<Task> => {
        const response = await apiClient.post<ApiResponse<Task>>(
            `/groups/${groupId}/tasks/${parentTaskId}/subtasks`,
            data
        )
        return response.data.data
    },

    // Subtasks einer Aufgabe abrufen
    getSubtasks: async (groupId: string, taskId: string): Promise<Task[]> => {
        const response = await apiClient.get<ApiResponse<Task[]>>(
            `/groups/${groupId}/tasks/${taskId}/subtasks`
        )
        return response.data.data
    },

    // Aufgaben verknüpfen
    linkTasks: async (
        groupId: string,
        taskId: string,
        data: LinkTaskRequest
    ): Promise<Task> => {
        const response = await apiClient.post<ApiResponse<Task>>(
            `/groups/${groupId}/tasks/${taskId}/links`,
            data
        )
        return response.data.data
    },

    // Aufgaben-Verknüpfung entfernen
    unlinkTasks: async (
        groupId: string,
        taskId: string,
        linkedTaskId: string
    ): Promise<Task> => {
        const response = await apiClient.delete<ApiResponse<Task>>(
            `/groups/${groupId}/tasks/${taskId}/links/${linkedTaskId}`
        )
        return response.data.data
    },

    // Alle erledigten Aufgaben einer Gruppe archivieren
    archiveCompletedTasks: async (
        groupId: string
    ): Promise<{ archivedCount: number }> => {
        const response = await apiClient.post<
            ApiResponse<{ archivedCount: number }>
        >(`/groups/${groupId}/tasks/archive-completed`)
        return response.data.data
    },

    // Meine Aufgaben abrufen (gruppenübergreifend)
    getMyTasks: async (): Promise<TaskWithDetails[]> => {
        const response =
            await apiClient.get<ApiResponse<TaskWithDetails[]>>('/tasks/my')
        return response.data.data
    },

    // Attachment hochladen
    uploadAttachment: async (
        groupId: string,
        taskId: string,
        file: File
    ): Promise<TaskAttachment> => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await apiClient.post<ApiResponse<TaskAttachment>>(
            `/groups/${groupId}/tasks/${taskId}/attachments`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data.data
    },

    // Attachments abrufen
    getAttachments: async (
        groupId: string,
        taskId: string
    ): Promise<TaskAttachment[]> => {
        const response = await apiClient.get<ApiResponse<TaskAttachment[]>>(
            `/groups/${groupId}/tasks/${taskId}/attachments`
        )
        return response.data.data
    },

    // Attachment löschen
    deleteAttachment: async (
        groupId: string,
        taskId: string,
        attachmentId: string
    ): Promise<void> => {
        await apiClient.delete(
            `/groups/${groupId}/tasks/${taskId}/attachments/${attachmentId}`
        )
    },

    // Aufgabe mit optionalem Beweis-Foto abschließen
    completeTaskWithProof: async (
        groupId: string,
        taskId: string,
        proofFile?: File,
        note?: string
    ): Promise<Task> => {
        const formData = new FormData()
        if (proofFile) {
            formData.append('proof', proofFile)
        }
        if (note) {
            formData.append('note', note)
        }
        const response = await apiClient.post<ApiResponse<Task>>(
            `/groups/${groupId}/tasks/${taskId}/complete`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data.data
    },
}
