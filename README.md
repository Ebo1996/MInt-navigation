# Smart Visitor Guidance System

A full-stack visitor guidance system with role-based access, QR management, department/sector administration, visitor feedback, and analytics.

## Overview

This repository contains two main parts:

- `backend/`: Express API server with MongoDB integration, authentication, departments, sectors, QR generation, feedback, settings, and admin controls.
- `frontend/`: React + Vite SPA for login, dashboards, analytics, feedback review, and administration.

## Key Features

- Role-based authentication for `admin`, `general_manager`, and `department_manager`
- JWT-based API security
- Department and sector management
- Feedback collection and review
- QR code generation and visitor tracking support
- Admin analytics and settings management
- Protected frontend routes based on user roles

## Prerequisites

- Node.js 18+ or compatible
- npm or yarn
- MongoDB running locally or accessible remotely

## Environment Configuration

### Backend

Create a `.env` file in `backend/` with the following values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_visitor_guidance
JWT_SECRET=replace_with_strong_secret_key
JWT_EXPIRES_IN=30m
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend

Create a `.env` file in `frontend/` with the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## Setup

### Backend

1. Open a terminal and navigate to `backend/`
2. Install dependencies:

```bash
cd backend
npm install
```

3. Start the backend server:

```bash
npm run dev
```

4. Optional utilities:

- `npm run seed` — seed initial data
- `npm run bootstrap:admin` — create an admin user
- `npm run seed:users` — seed sample user accounts

### Frontend

1. Open a separate terminal and navigate to `frontend/`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the frontend development server:

```bash
npm run dev
```

## Available Scripts

### Backend

- `npm start` — run the server normally
- `npm run dev` — run with `nodemon`
- `npm run seed` — seed sample database data
- `npm run bootstrap:admin` — create an admin user
- `npm run seed:users` — seed users

### Frontend

- `npm run dev` — run Vite development server
- `npm run build` — build production bundle
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Folder Structure

- `backend/`
  - `controllers/` — request handlers
  - `routes/` — Express route definitions
  - `models/` — Mongoose schemas
  - `services/` — business logic and data access
  - `middleware/` — authentication and error handling
  - `validators/` — request validation rules
  - `utils/` — helpers and utilities

- `frontend/`
  - `src/` — application source files
  - `src/pages/` — route pages
  - `src/components/` — shared UI components
  - `src/context/` — authentication state provider
  - `src/services/` — API client wrappers
  - `src/api/` — API base client

## Notes

- The backend expects the frontend to use `http://localhost:5173` by default via CORS.
- Protected routes are enforced in the frontend using `ProtectedRoute` and roles defined in the auth context.
- The API is mounted under `/api/` and includes auth, departments, feedback, QR, sectors, settings, and admin endpoints.

## License

This project does not include a license file. Add one if you plan to share or distribute the code.
