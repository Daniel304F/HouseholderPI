# HouseholderPI

HouseholderPI is a full-stack web application for household organization, task management, and group collaboration.

## Tech Stack

- Client: React 19, TypeScript, Vite, Tailwind CSS, React Query, React Router
- Server: Node.js, Express, TypeScript, MongoDB, Socket.IO, JWT Auth

## Project Structure

```text
HouseholderPI/
  client/     # Frontend (Vite + React)
  server/     # Backend (Express + MongoDB + Socket.IO)
```

## Prerequisites

- Node.js 20+
- npm
- MongoDB (local or via Docker)

## Installation

### 1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Start MongoDB

Option A: Use a locally installed MongoDB instance.

Option B: Use Docker Compose in the server directory:

```bash
cd server
docker compose up -d
```

## Environment Variables

### Server (`server/.env`)

Example values (adjust to your setup):

```env
PORT=3000
NODE_ENV=development

DB_USE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_USER=admin
DB_PASSWORD=secretpassword
DB_NAME=myappdb
DB_AUTH_SOURCE=admin

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_ACCESS_EXPIRES_IN=86400
JWT_REFRESH_EXPIRES_IN=604800

BCRYPT_SALT_ROUNDS=12

VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_VAPID_PUBLIC_KEY=...
```

Note: If `VITE_API_URL` is not set, the client falls back to `http://localhost:3000/api`.

## Run in Development

You need two terminals.

### Terminal 1: Server

```bash
cd server
npm run dev
```

The server runs by default on `http://localhost:3000`.

### Terminal 2: Client

```bash
cd client
npm run dev
```

The client runs by default on `http://localhost:5173`.

## Available Scripts

### Client (`client/package.json`)

- `npm run dev` - Vite dev server
- `npm run build` - TypeScript build + Vite production build
- `npm run lint` - ESLint
- `npm run preview` - Local preview of the production build

### Server (`server/package.json`)

- `npm run dev` - Start with `tsx` + `nodemon`
- `npm run build` - TypeScript compilation to `dist/`
- `npm run start` - Start compiled server
- `npm run lint` - ESLint for `src/**/*.ts`

## Architecture Overview

### Client

Important folders in `client/src`:

- `api/` - HTTP API layer
- `components/` - UI components
- `hooks/` - Reusable React hooks
- `pages/` - Pages (dashboard, etc.)
- `contexts/` - Global React contexts (Auth, Toast)
- `lib/` - Infrastructure (e.g., Axios client)

### Server

Important folders in `server/src`:

- `routes/` - Express routing
- `controllers/` - Request handlers
- `services/` - Business logic / infrastructure services
- `middlewares/` - Auth, logging, error handling
- `models/` - Domain models
- `schemas/` - Validation

## API and Realtime

- REST API base: `/api/...`
- Static uploads: `/uploads/...`
- Socket.IO enabled on the same server
- CORS is currently configured for `http://localhost:5173`

## Tests

currently no tests

## License

MIT
