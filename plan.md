# Plan: Completed Tasks archivieren + Scrollbare Spalten

## Übersicht

**a) Archivierung:** Button in der Completed-Spalte, der alle erledigten Aufgaben aus dem Gruppen-Board entfernt. Die Aufgaben bleiben in der persönlichen Historie (`TaskHistory`) erhalten.

**b) Scrollbar-Fix:** KanbanCards bekommen `flex-shrink-0`, damit sie nicht zusammengedrückt werden.

---

## Änderungen

### 1. Backend: Task-Model erweitern
**Datei:** `server/src/models/task.ts`
- Neues Feld `archived: boolean` (default `false`) zum Task-Interface hinzufügen

### 2. Backend: Task-Response erweitern
**Datei:** `server/src/services/task.service.ts`
- `toTaskResponse` um `archived` erweitern
- `getGroupTasks` filtern: `archived !== true` (damit archivierte Tasks nicht im Board erscheinen)
- `getMyTasks` bleibt unverändert → archivierte Tasks sind weiterhin in der persönlichen Historie sichtbar

### 3. Backend: Schema erweitern
**Datei:** `server/src/schemas/task.schema.ts`
- `updateTaskSchema` um optionales `archived: z.boolean()` erweitern

### 4. Backend: Bulk-Archive Endpoint
**Datei:** `server/src/controllers/taskController.ts`
- Neuer Endpoint `archiveCompletedTasks`: Setzt `archived: true` für alle completed Tasks in einer Gruppe

**Datei:** `server/src/services/task.service.ts`
- Neue Methode `archiveCompletedTasks(groupId)`: Bulk-Update aller completed Tasks

**Datei:** `server/src/routes/taskRoutes.ts`
- Neue Route: `POST /archive-completed` → `taskController.archiveCompletedTasks`

### 5. Frontend: Task-Type + API erweitern
**Datei:** `client/src/api/tasks.ts`
- `Task` Interface: `archived` Feld hinzufügen
- Neue Funktion `archiveCompletedTasks(groupId)`

### 6. Frontend: KanbanColumn — Archiv-Button
**Datei:** `client/src/components/board/KanbanColumn.tsx`
- Neuer optionaler Callback `onArchiveCompleted` in Props
- Wenn `column.id === 'completed'` und Tasks vorhanden: Archive-Button im Header (neben dem `...`-Button) anzeigen
- Icon: `Archive` aus lucide-react

### 7. Frontend: KanbanBoard — Archive-Handler
**Datei:** `client/src/components/board/KanbanBoard.tsx`
- Neuen `onArchiveCompleted` Prop durchreichen an die completed-Spalte

### 8. Frontend: GroupDetail — Archive Mutation
**Datei:** `client/src/pages/dashboard/GroupDetail.tsx`
- `useMutation` für `archiveCompletedTasks`
- Query-Invalidierung nach Erfolg
- Handler an KanbanBoard übergeben

### 9. Fix: KanbanCard nicht zusammendrücken
**Datei:** `client/src/components/board/KanbanCard.tsx`
- `flex-shrink-0` zum äußeren `<div>` hinzufügen → Karten behalten ihre Größe in der scrollbaren Spalte
