# HouseHolderPI

**Moderne Web-App zur Organisation von Haushaltsaufgaben in WGs.**

Organisiere Aufgaben, motiviere Mitbewohner:innen durch Gamification und behalte den Überblick über euer gemeinsames Leben.

---

## Features

### Umgesetzt

- 🗂️ **Kanban-Board** – Aufgaben im Jira-Stil mit Drag & Drop
- ✅ **Aufgabenverwaltung** – Aufgaben erstellen, zuweisen, kommentieren, mit Fotos dokumentieren
- 👥 **Gruppenansicht** – Übersicht aller WG-Mitglieder und deren Aufgaben
- 📊 **Dashboard** – Statistiken & Aktivitäten
- 🏆 **Gamification** – Streaks, Abzeichen, Statistiken

### In Entwicklung / Geplant

- 📅 Kalenderintegration (Google Calendar)
- 🔔 Push-Benachrichtigungen
- ♻️ Wiederkehrende Aufgaben
- 📱 Mobile-Optimierung

---

## Tech Stack

### Frontend

| Technologie        | Verwendung                       |
| ------------------ | -------------------------------- |
| **React 18**       | UI-Framework                     |
| **TypeScript**     | Typsicherheit                    |
| **Tailwind CSS**   | Styling                          |
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

---

## Projektstruktur

```
HouseholderPI/
├── client/                  # Frontend (React)
│   ├── src/
│   │   ├── api/             # API-Schnittstellen
│   │   ├── assets/          # Statische Assets
│   │   ├── components/      # UI-Komponenten (z.B. navigation/, tasks/, board/, ...)
│   │   ├── config/          # Konfigurationen
│   │   ├── constants/       # Konstanten
│   │   ├── contexts/        # React Contexts
│   │   ├── hooks/           # Custom Hooks
│   │   ├── layouts/         # Layout-Komponenten
│   │   ├── lib/             # Bibliotheken & Query-Client
│   │   ├── pages/           # Seiten-Komponenten
│   │   ├── utils/           # Hilfsfunktionen
│   │   ├── App.tsx          # App-Komponente
│   │   ├── main.tsx         # Entry Point
│   │   └── routes.tsx       # Routen
│   ├── public/              # Statische Dateien
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                  # Backend (Express)
│   ├── src/
│   │   ├── config/          # Konfiguration
│   │   ├── controllers/     # Request Handler
│   │   ├── helpers/         # Hilfsfunktionen
│   │   ├── middlewares/     # Express Middlewares
│   │   ├── models/          # Datenmodelle
│   │   ├── routes/          # API-Routen
│   │   ├── schemas/         # Validierungsschemas
│   │   ├── services/        # Business Logic
│   │   ├── types/           # TypeScript Types
│   │   ├── app.ts           # Express App Setup
│   │   ├── db.ts            # DB-Verbindung
│   │   └── server.ts        # Server Entry Point
│   ├── docker-compose.yml   # (Optional) Docker Setup
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── CLAUDE.md
```

---

## Installation & Entwicklung

### Voraussetzungen

- Node.js 20+
- npm oder pnpm
- Lokale MongoDB-Instanz (oder Cloud)

### Setup

```bash
# Repository klonen
git clone https://github.com/username/householderpi.git
cd HouseholderPI

# Frontend installieren
cd client
npm install

# Backend installieren
cd ../server
npm install

# .env Datei anlegen (siehe Beispiel)
# MongoDB starten

# Backend starten
npm run dev

# Frontend starten (neues Terminal)
cd ../client
npm run dev
```

Die App ist dann erreichbar unter `http://localhost:5173` (Frontend) und `http://localhost:3000` (Backend).

---

## Self-Hosting (z.B. Raspberry Pi)

HouseHolderPI ist für Self-Hosting optimiert:

1. **Geringe Anforderungen** – MongoDB kann lokal oder remote laufen
2. **Einfache Backups** – Datenbank ist eine einzelne Datei (bei SQLite, optional)
3. **Docker-Support** – Optional für einfaches Deployment

Eine Anleitung für das Deployment auf einem Raspberry Pi folgt.

---

## Lizenz

MIT

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
