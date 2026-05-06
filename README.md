# Team Task Manager Assignment

Full-stack team task manager built with a React + Vite frontend and a Node.js + Express backend.

## Features

- Signup and login authentication
- JWT protected APIs
- Admin and Member role-based access
- Admin project creation and management
- Admin task creation and assignment
- Member dashboard with assigned projects and tasks
- Task status tracking: Todo, In Progress, Done
- Dashboard summary for total tasks, in-progress tasks, and overdue tasks
- MongoDB Atlas database with Mongoose relationships

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB Atlas, Mongoose
- Authentication: JWT, bcryptjs
- Packages: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv

## Project Structure

```text
.
|-- clien/
|   `-- React frontend
`-- server/
    `-- Express backend
```

## Backend Setup

```powershell
cd server
npm install
Copy-Item .env.example .env
npm.cmd run dev
```

Update `server/.env` before starting the backend.

```text
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Frontend Setup

```powershell
cd clien
npm install
npm.cmd run dev
```

## Root Commands

```powershell
npm run client:dev
npm run client:build
npm run client:lint
npm run server:dev
```

## API Routes

```text
GET    /
GET    /api/test

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/dashboard/summary

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

Protected routes require:

```text
Authorization: Bearer <token>
```

## Role Access

```text
Admin:
- Create, update, delete, and view all projects
- Create, update, delete, and view all tasks
- View full dashboard summary

Member:
- View assigned projects
- View assigned tasks
- Update status of assigned tasks
- View personal dashboard summary
```

## Verification Done

- Admin registration and login tested
- Member registration and login tested
- JWT verification tested
- Project creation tested
- Task creation tested
- Task status update tested
- MongoDB Atlas collections verified
- Frontend lint and production build passed
