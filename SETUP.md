# MinT Navigator — Local Setup Guide

## Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (v6 or higher)

---

## Step 1 — Restore the Database

A database dump is included in the `mint-navigator-dump/` folder.

Open a terminal in the project root and run:

```bash
mongorestore --db mint-navigator ./mint-navigator-dump/mint-navigator
```

> This loads all the data into your local MongoDB instance.

---

## Step 2 — Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Step 3 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Step 4 — Start MongoDB (if not already running)

**Windows (if not running as a service):**
```bash
mongod
```

**Windows (if installed as a service):**
```bash
net start MongoDB
```

---

## Step 5 — Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ [DATABASE] Connected to Local MongoDB
🚀 MINT BACKEND: RUNNING IN DEV MODE
📡 LOCAL ACCESS: http://localhost:5000/api
```

---

## Step 6 — Start the Frontend

```bash
cd frontend
npm run dev
```

Open your browser at: **http://localhost:5173**

---

## Configuration

The backend `.env` is already set to use local MongoDB:

```
MONGODB_URI=mongodb://127.0.0.1:27017/mint-navigator
PORT=5000
NODE_ENV=development
```

No changes needed.

---

## Verify Everything Works

Visit: `http://localhost:5000/api/health`

Expected response:
```json
{
  "status": "ONLINE",
  "database": "CONNECTED"
}
```
