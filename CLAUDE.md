# Projektname: HouseHolderPI

Dieses Projekt beschäftigt sich mit der Frage, wie ein Haushalt in einer gemeinsamen Wohnung besser organisiert werden kann. Dazu sollen verschiedene Funktionen
bereitgestellt werden. Diese Applikation erlaubt es dem Nutzer Gruppen zu erstellen und zu verwalten. Jede Gruppe verfügt über ein Kanban board mit den Punkten in To-Do, In Progress und Completed. Zusätzlich können in einer Gruppe Statistiken und Nachrichten in einem Chat angesehen werden. Innerhalb des Kanban-Boardes können die unterschiedlichen
Aufgaben nachvollzogen werden. Eine Aufgabe hat dabei eine kurze Beschreibung, was getan werden muss, einen Titel, Kommentare und angehängte Dateien. Weiterhin können Aufgaben auch gesucht werden in einer Gruppe. Jedes Gruppen Mitglied kann grundsätzlich diese Aufgaben erstellen und reinlegen. Die Verwaltung einer Gruppe kann zusätzlich unterstützt werden durch ein integriertes LLM, das die Zugriff auf die Aufgaben in einer Gruppe hat. Weiterhin sollen Aufgaben noch fair aufgeteilt werden und automatisch in Google Kalender integriert werden können. Die Anwendung kann zusätzlich Benachrichtigungen schicken, wenn eine Aufgabe im Haushalt ansteht. Jeder Nutzer kann seine Aufgaben und Statistiken ansehen unter den jeweiligen Reitern.

# Techstack

- Frontend: React 19, TypeScript, Vite, TanStack Query, Axios, Tailwind CSS
- Backend: Node.js, Express 5, MongoDB, Zod
- Auth: JWT (Access + Refresh Token), bcrypt

# Projektstruktur

Bisherige Projektstruktur, die in Zukunft erweirtert werden kann:

```
HouseholderPI/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── api/                    # API-Schnittstellen (auth.ts, friends.ts, groups.ts, tasks.ts)
│   │   ├── components/             # React Komponenten
│   │   │   ├── auth/
│   │   │   ├── board/
│   │   │   ├── friends/
│   │   │   └── groups/
│   │   ├── contexts/               # React Contexts (AuthContext, HeaderContext)
│   │   ├── hooks/                  # Custom Hooks (useSidebar, useViewport)
│   │   ├── layouts/                # Layout Komponenten
│   │   ├── pages/                  # Seiten (Login, Register, Dashboard/*)
│   │   ├── lib/                    # axios.ts, query.ts
│   │   └── utils/
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                 # config.ts (zentrale Konfiguration)
│   │   ├── controllers/            # authController, friendController, groupController, taskController
│   │   ├── models/                 # user.ts, group.ts, friend.ts, task.ts, entity.ts
│   │   │   └── mongodb/            # mongo.dao.ts (Generic DAO)
│   │   ├── routes/                 # authRoutes, friendRoutes, groupRoutes, taskRoutes
│   │   ├── schemas/                # Zod Schemas (auth, friend, group, task)
│   │   ├── middlewares/            # auth, errorHandler, validation, logger
│   │   ├── services/               # jwt.service.ts
│   │   ├── helpers/                # date.helper.ts
│   │   ├── types/
│   │   ├── app.ts                  # Express App Setup
│   │   ├── db.ts                   # DB Initialisierung
│   │   └── server.ts               # Entry Point
│   └── package.json
│
└── Claude.md
```

# NPM Scripts

## Client

```bash
npm run dev      # Vite Dev-Server (localhost:5173)
npm run build    # TypeScript kompilieren + Vite Build
npm run lint     # ESLint
npm run preview  # Vite Preview
```

## Server

```bash
npm run dev      # Nodemon mit tsx (Auto-Reload)
npm run build    # TypeScript kompilieren
npm start        # Server aus dist/ starten
npm run lint     # ESLint
```

# API-Routen

Base URL: `http://localhost:3000/api`

## Auth (`/api/auth`)

| Methode | Route       | Auth | Beschreibung   |
| ------- | ----------- | ---- | -------------- |
| POST    | `/register` | ❌   | Registrieren   |
| POST    | `/login`    | ❌   | Anmelden       |
| POST    | `/refresh`  | ❌   | Token erneuern |
| POST    | `/logout`   | ❌   | Abmelden       |
| GET     | `/me`       | ✓    | Aktueller User |

## Friends (`/api/friends`)

| Methode | Route                          | Auth | Beschreibung         |
| ------- | ------------------------------ | ---- | -------------------- |
| GET     | `/`                            | ✓    | Alle Freunde         |
| GET     | `/requests`                    | ✓    | Empfangene Anfragen  |
| GET     | `/requests/sent`               | ✓    | Gesendete Anfragen   |
| POST    | `/request`                     | ✓    | Anfrage senden       |
| POST    | `/requests/:requestId/respond` | ✓    | Anfrage beantworten  |
| DELETE  | `/requests/:requestId`         | ✓    | Anfrage zurückziehen |
| DELETE  | `/:friendId`                   | ✓    | Freund entfernen     |

## Groups (`/api/groups`)

| Methode | Route                         | Auth | Beschreibung                |
| ------- | ----------------------------- | ---- | --------------------------- |
| POST    | `/`                           | ✓    | Gruppe erstellen            |
| GET     | `/`                           | ✓    | Meine Gruppen               |
| GET     | `/:groupId`                   | ✓    | Gruppe abrufen              |
| PATCH   | `/:groupId`                   | ✓    | Gruppe aktualisieren        |
| DELETE  | `/:groupId`                   | ✓    | Gruppe löschen              |
| POST    | `/join`                       | ✓    | Beitreten (via Invite-Code) |
| POST    | `/:groupId/leave`             | ✓    | Verlassen                   |
| POST    | `/:groupId/regenerate-invite` | ✓    | Invite-Code erneuern        |
| PATCH   | `/:groupId/members/:memberId` | ✓    | Mitglied bearbeiten         |
| DELETE  | `/:groupId/members/:memberId` | ✓    | Mitglied entfernen          |

## Tasks (`/api/groups/:groupId/tasks`)

| Methode | Route            | Auth | Beschreibung                    |
| ------- | ---------------- | ---- | ------------------------------- |
| POST    | `/`              | ✓    | Aufgabe erstellen               |
| GET     | `/`              | ✓    | Alle Aufgaben der Gruppe        |
| GET     | `/:taskId`       | ✓    | Einzelne Aufgabe abrufen        |
| PATCH   | `/:taskId`       | ✓    | Aufgabe aktualisieren           |
| DELETE  | `/:taskId`       | ✓    | Aufgabe löschen                 |
| PATCH   | `/:taskId/assign`| ✓    | Aufgabe zuweisen/Zuweisung entfernen |

# Datenmodelle

## Entity (Basis)

```typescript
interface Entity {
  id: string; // UUID
  createdAt: Date;
  updatedAt: Date;
}
```

## User

```typescript
interface User extends Entity {
  email: string;
  name: string;
  password: string; // bcrypt Hash
  avatar?: string;
}
```

## Group

```typescript
interface GroupMember {
  userId: string;
  role: "owner" | "admin" | "member";
  isActiveResident: boolean;
  joinedAt: Date;
}

interface Group extends Entity {
  name: string;
  inviteCode: string;
  members: GroupMember[];
  activeResidentsCount: number;
  picture?: string;
}
```

## Friendship

```typescript
type FriendshipStatus = "pending" | "accepted" | "rejected";

interface Friendship extends Entity {
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
}
```

## Task

```typescript
type TaskStatus = "pending" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task extends Entity {
  groupId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  dueDate: Date;
  createdBy: string;
}
```

# Authentifizierung

## JWT Token Flow

- **Access Token**: Kurzlebig (1h), im localStorage
- **Refresh Token**: Langlebig (7d), im HTTP-Only Cookie
- Auth Middleware prüft `Authorization: Bearer <token>` Header

## Wichtige Dateien

- `server/src/services/jwt.service.ts` - Token-Generierung/Validierung
- `server/src/middlewares/auth.middleware.ts` - Route-Schutz
- `client/src/contexts/AuthContext.tsx` - Auth State
- `client/src/lib/axios.ts` - Interceptors für Auto-Refresh

# Konventionen

## Backend Patterns

- **Controller Pattern**: Business-Logik in Controllers (`server/src/controllers/`)
- **Generic DAO**: `server/src/models/mongodb/mongo.dao.ts` für DB-Operationen
- **Zod Validation**: Schemas in `server/src/schemas/`, Middleware validiert automatisch

## Frontend Patterns

- **React Query**: Server State Management (`client/src/lib/query.ts`)
- **Context API**: Auth State (`client/src/contexts/AuthContext.tsx`)
- **Protected Routes**: `client/src/pages/ProtectedRoute.tsx`
- **API Client**: Funktionen in `client/src/api/`

# Environment Variables

Server `.env`:

```env
PORT=3000
NODE_ENV=development

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

BCRYPT_SALT_ROUNDS=12

DB_USE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_USER=admin
DB_PASSWORD=...
DB_NAME=myappdb
DB_AUTH_SOURCE=admin
```

# Wichtige Dateien

| Datei                         | Beschreibung           |
| ----------------------------- | ---------------------- |
| `server/src/server.ts`        | Server Entry Point     |
| `server/src/app.ts`           | Express App Setup      |
| `server/src/config/config.ts` | Zentrale Konfiguration |
| `client/src/main.tsx`         | Client Entry Point     |
| `client/src/App.tsx`          | React App Wrapper      |
| `client/src/routes.tsx`       | Route Definitionen     |
