# HouseHolder

Eine moderne Web-App zur Verwaltung von Haushaltsaufgaben in Wohngemeinschaften. Organisiert Aufgaben, motiviert durch Gamification und macht das Zusammenleben einfacher.

## Features

### Kernfunktionen

- **Kanban-Board** – Aufgaben im Jira-Stil verwalten mit Drag & Drop
- **Aufgabenverwaltung** – Aufgaben erstellen, zuweisen und mit Fotos dokumentieren
- **Gruppenansicht** – Übersicht aller WG-Mitglieder und deren Aufgaben
- **Dashboard** – Statistiken und Übersicht der Haushaltsaktivitäten

### Gamification

- **Streak-System** – Belohnungen für regelmäßiges Erledigen von Aufgaben
- **Abzeichen** – Achievements für besondere Leistungen
- **Statistiken** – Persönliche und Gruppen-Performance im Überblick

### Geplant

- **Kalenderintegration** – Aufgaben mit Terminen verknüpfen
- **Push-Benachrichtigungen** – Erinnerungen für fällige Aufgaben
- **Recurring Tasks** – Wiederkehrende Aufgaben automatisch erstellen

## Tech Stack

### Frontend

| Technologie        | Verwendung                       |
| ------------------ | -------------------------------- |
| **React 18**       | UI-Framework                     |
| **TypeScript**     | Typsicherheit                    |
| **Tailwind CSS 4** | Styling                          |
| **TanStack Query** | Server-State Management, Caching |
| **Zustand**        | Client-State Management          |
| **React Router**   | Routing                          |
| **Axios**          | HTTP-Client                      |
| **Lucide React**   | Icons                            |

### Backend

| Technologie    | Verwendung    |
| -------------- | ------------- |
| **Node.js**    | Runtime       |
| **Express**    | Web-Framework |
| **TypeScript** | Typsicherheit |
| **MongoDB**    | Datenbank     |

### Tooling

| Tool         | Verwendung              |
| ------------ | ----------------------- |
| **Vite**     | Build Tool & Dev Server |
| **ESLint**   | Linting                 |
| **Prettier** | Code Formatting         |

## Projektstruktur

```
householder/
├── client/                     # Frontend
│   ├── src/
│   │   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   │   ├── navigation/     # Navigation (Header, Mobile Nav)
│   │   │   ├── ui/             # Basis-Komponenten (Button, Input, Card)
│   │   │   ├── tasks/          # Task-spezifische Komponenten
│   │   │   └── dashboard/      # Dashboard-Widgets
│   │   │
│   │   ├── contexts/           # React Contexts
│   │   ├── hooks/              # Custom Hooks
│   │   ├── layouts/            # Layout-Komponenten
│   │   ├── lib/                # Externe Bibliotheken & Konfiguration
│   │   │   ├── axios.ts        # Axios-Instanz
│   │   │   └── queryClient.ts  # TanStack Query Client
│   │   │
│   │   ├── pages/              # Seiten-Komponenten
│   │   ├── services/           # API-Service Layer
│   │   ├── stores/             # Zustand Stores
│   │   ├── types/              # TypeScript Types & Interfaces
│   │   ├── utils/              # Hilfsfunktionen
│   │   │
│   │   ├── App.tsx             # App-Komponente
│   │   ├── routes.tsx          # Route-Definitionen
│   │   ├── main.tsx            # Entry Point
│   │   └── index.css           # Globale Styles & Tailwind
│   │
│   ├── public/                 # Statische Assets
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend
│   ├── src/
│   │   ├── config/             # Konfiguration
│   │   ├── controllers/        # Request Handler
│   │   ├── middlewares/        # Express Middlewares
│   │   ├── routes/             # API-Routen
│   │   ├── services/           # Business Logic
│   │   ├── types/              # TypeScript Types
│   │   ├── utils/              # Hilfsfunktionen
│   │   │
│   │   ├── app.ts              # Express App Setup
│   │   └── server.ts           # Server Entry Point
│   │
│   ├── prisma/
│   │   └── schema.prisma       # Datenbank-Schema
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                     # Geteilte Types (optional)
│   └── types/
│
└── README.md
```

## Installation

### Voraussetzungen

- Node.js 20+
- npm oder pnpm

### Setup

```bash
# Repository klonen
git clone https://github.com/username/householder.git
cd householder

# Frontend Dependencies
cd client
npm install

# Backend Dependencies
cd ../server
npm install

# Datenbank initialisieren
npx prisma migrate dev
```

### Entwicklung starten

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Die App ist dann erreichbar unter `http://localhost:5173`.

## Self-Hosting (Raspberry Pi)

HouseHolder ist für Self-Hosting optimiert:

1. **Geringe Anforderungen** – SQLite benötigt keinen separaten DB-Server
2. **Einfache Backups** – Datenbank ist eine einzelne Datei
3. **Docker-Support** – Optional für einfaches Deployment

Eine ausführliche Anleitung für das Deployment auf einem Raspberry Pi folgt.

## Lizenz

MIT
